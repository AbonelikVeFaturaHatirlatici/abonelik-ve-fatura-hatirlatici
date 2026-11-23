"""Doğrulama ve HTTP hata mesajlarını Türkçeye çevirir (D-19, NFR-C2, NFR-U5).

Saf fonksiyonlar: FastAPI'ye bağlı değildir. Girdi, `RequestValidationError.errors()`
ya da `pydantic.ValidationError.errors()` listesidir. Yanıta yalnızca ilk hata yazılır;
mesajda İngilizce Pydantic metni, ham `loc` veya hata türü hiçbir zaman yer almaz.
"""

from collections.abc import Mapping, Sequence
from http import HTTPStatus
from typing import Any

GENERIC_MESSAGE = "İstek gövdesi veya parametreler geçersiz."

# Bu türdeki hataların mesajı uygulamanın kendisi tarafından Türkçe üretilir
# (ör. şemada `PydanticCustomError("domain_rule", DomainValidationError.message)`);
# olduğu gibi kullanılır.
PASS_THROUGH_TYPES = frozenset({"domain_rule"})

# Sözleşmedeki JSON alan adı -> kullanıcıya gösterilen Türkçe ad
FIELD_LABELS: dict[str, str] = {
    "email": "E-posta",
    "password": "Şifre",
    "serviceName": "Servis adı",
    "amountKurus": "Tutar",
    "period": "Periyot",
    "startDate": "Başlangıç tarihi",
    "id": "Abonelik kimliği",
}

# Starlette'in varsayılan İngilizce `detail` metinleri ("Not Found", "Method Not Allowed")
# yerine kullanılan Türkçe mesajlar. Özel bir `detail` verilmişse o kullanılır.
HTTP_DEFAULT_MESSAGES: dict[int, str] = {
    HTTPStatus.BAD_REQUEST: "İstek geçersiz.",
    HTTPStatus.UNAUTHORIZED: "Geçerli bir oturum gerekli.",
    HTTPStatus.FORBIDDEN: "Bu işlem için yetkiniz yok.",
    HTTPStatus.NOT_FOUND: "İstenen adres bulunamadı.",
    HTTPStatus.METHOD_NOT_ALLOWED: "Bu adres bu HTTP yöntemini desteklemiyor.",
}
HTTP_FALLBACK_MESSAGE = "İstek işlenemedi."

_LOCATION_PREFIXES = frozenset({"body", "query", "path", "header", "cookie"})


def _field_name(loc: Sequence[Any]) -> str | None:
    """("body", "amountKurus") -> "amountKurus"; ("body",) -> None (gövdenin kendisi)."""
    parts = [str(part) for part in loc if not isinstance(part, int)]
    if parts and parts[0] in _LOCATION_PREFIXES:
        parts = parts[1:]
    return parts[-1] if parts else None


def _label(field: str | None) -> str:
    if field is None:
        return "İstek gövdesi"
    return FIELD_LABELS.get(field, field)


def _expected_values(ctx: Mapping[str, Any]) -> str:
    """Pydantic'in "'monthly' or 'yearly'" metnini "monthly veya yearly" yapar."""
    expected = str(ctx.get("expected", ""))
    return expected.replace("'", "").replace(" or ", " veya ")


def translate_error(error: Mapping[str, Any]) -> str:
    """Tek bir Pydantic hatasını Türkçe kullanıcı mesajına çevirir."""
    error_type = str(error.get("type", ""))
    ctx: Mapping[str, Any] = error.get("ctx") or {}
    field = _field_name(error.get("loc", ()))
    label = _label(field)

    if error_type in PASS_THROUGH_TYPES:
        return str(error.get("msg") or GENERIC_MESSAGE)

    if error_type == "json_invalid":
        return "İstek gövdesi geçerli bir JSON değil."
    if error_type == "missing":
        if field is None:
            return "İstek gövdesi zorunludur."
        return f"{label} alanı zorunludur."
    if error_type in {"model_attributes_type", "dict_type", "model_type"}:
        return "İstek gövdesi bir JSON nesnesi olmalıdır."

    if error_type == "value_error" and field == "email":
        return "Geçerli bir e-posta adresi girin."
    if error_type in {"string_type", "string_unicode"}:
        return f"{label} metin olmalıdır."
    if error_type == "string_too_short":
        min_length = ctx.get("min_length", 1)
        if min_length == 1:
            return f"{label} boş olamaz."
        return f"{label} en az {min_length} karakter olmalıdır."
    if error_type == "string_too_long":
        return f"{label} en fazla {ctx.get('max_length')} karakter olabilir."

    if error_type in {"int_type", "int_parsing", "int_from_float", "bool_type"}:
        return f"{label} tamsayı olmalıdır."
    if error_type in {"greater_than_equal", "greater_than"}:
        return f"{label} en az {ctx.get('ge', ctx.get('gt'))} olmalıdır."
    if error_type in {"less_than_equal", "less_than"}:
        return f"{label} en fazla {ctx.get('le', ctx.get('lt'))} olabilir."

    if error_type.startswith("date_"):
        return f"{label} YYYY-MM-DD biçiminde geçerli bir tarih olmalıdır."
    if error_type in {"enum", "literal_error"}:
        allowed = _expected_values(ctx)
        return f"{label} yalnızca şu değerlerden biri olabilir: {allowed}."
    if error_type.startswith("uuid_"):
        return f"{label} geçerli bir UUID olmalıdır."

    return f"{label} geçersiz." if field is not None else GENERIC_MESSAGE


def translate_errors(errors: Sequence[Mapping[str, Any]]) -> str:
    """İlk hatanın Türkçe mesajı; liste boşsa genel mesaj."""
    if not errors:
        return GENERIC_MESSAGE
    return translate_error(errors[0])


def http_error_message(status_code: int, detail: object) -> str:
    """Starlette'in varsayılan İngilizce `detail` metni yerine Türkçe mesaj döndürür."""
    try:
        default_phrase: str | None = HTTPStatus(status_code).phrase
    except ValueError:
        default_phrase = None
    if detail is None or str(detail) == default_phrase:
        return HTTP_DEFAULT_MESSAGES.get(status_code, HTTP_FALLBACK_MESSAGE)
    return str(detail)
