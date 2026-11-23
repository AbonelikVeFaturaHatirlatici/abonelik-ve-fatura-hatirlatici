"""Düzeltme 3 (birim): Pydantic ve HTTP hata metinlerinin Türkçe çevirisi.

Hatalar, sözleşmedeki istek şemalarıyla aynı alanlara sahip yerel modellerden gerçek
Pydantic hatası olarak üretilir; FastAPI gerekmez.
"""

import re
from datetime import date
from typing import Any

import pytest
from pydantic import BaseModel, ConfigDict, EmailStr, Field, ValidationError
from pydantic.alias_generators import to_camel

from app.domain.renewal import Period
from app.infra.validation_messages import (
    GENERIC_MESSAGE,
    HTTP_DEFAULT_MESSAGES,
    http_error_message,
    translate_error,
    translate_errors,
)

# Pydantic/Starlette'in İngilizce metinlerinden parçalar: hiçbir mesajda görünmemeli.
ENGLISH_MARKERS = re.compile(
    r"Input should|Field required|String should|value is not|valid integer|"
    r"Not Found|Method Not Allowed|JSON decode|body\.|\(body",
    re.IGNORECASE,
)


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class SubscriptionCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    service_name: str = Field(min_length=1, max_length=100)
    amount_kurus: int = Field(strict=True, ge=1)
    period: Period
    start_date: date


def _payload(**overrides: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "serviceName": "Netflix",
        "amountKurus": 22999,
        "period": "monthly",
        "startDate": "2026-01-31",
    }
    payload.update(overrides)
    return payload


def _first_error(model: type[BaseModel], payload: Any) -> dict[str, Any]:
    with pytest.raises(ValidationError) as excinfo:
        model.model_validate(payload)
    return excinfo.value.errors()[0]


SUBSCRIPTION_CASES = [
    ({"amountKurus": "abc"}, "Tutar tamsayı olmalıdır."),
    ({"amountKurus": 229.99}, "Tutar tamsayı olmalıdır."),
    ({"amountKurus": True}, "Tutar tamsayı olmalıdır."),
    ({"amountKurus": 0}, "Tutar en az 1 olmalıdır."),
    (
        {"period": "weekly"},
        "Periyot yalnızca şu değerlerden biri olabilir: monthly veya yearly.",
    ),
    ({"serviceName": 42}, "Servis adı metin olmalıdır."),
    ({"serviceName": ""}, "Servis adı boş olamaz."),
    ({"serviceName": "x" * 101}, "Servis adı en fazla 100 karakter olabilir."),
    (
        {"startDate": "2026-02-30"},
        "Başlangıç tarihi YYYY-MM-DD biçiminde geçerli bir tarih olmalıdır.",
    ),
]


@pytest.mark.parametrize(("override", "expected"), SUBSCRIPTION_CASES)
def test_subscription_errors_are_translated(override, expected):
    error = _first_error(SubscriptionCreate, _payload(**override))
    assert translate_error(error) == expected


@pytest.mark.parametrize(
    ("field", "expected"),
    [
        ("serviceName", "Servis adı alanı zorunludur."),
        ("amountKurus", "Tutar alanı zorunludur."),
        ("period", "Periyot alanı zorunludur."),
        ("startDate", "Başlangıç tarihi alanı zorunludur."),
    ],
)
def test_missing_fields_are_translated(field, expected):
    payload = _payload()
    del payload[field]
    assert translate_error(_first_error(SubscriptionCreate, payload)) == expected


@pytest.mark.parametrize(
    ("payload", "expected"),
    [
        (
            {"email": "ayse@example.com", "password": "kisa"},
            "Şifre en az 8 karakter olmalıdır.",
        ),
        (
            {"email": "gecersiz-adres", "password": "x" * 8},
            "Geçerli bir e-posta adresi girin.",
        ),
        ({"password": "x" * 8}, "E-posta alanı zorunludur."),
    ],
)
def test_credentials_errors_are_translated(payload, expected):
    assert translate_error(_first_error(Credentials, payload)) == expected


@pytest.mark.parametrize(("override", "_expected"), SUBSCRIPTION_CASES)
def test_no_english_pydantic_text_leaks(override, _expected):
    message = translate_error(_first_error(SubscriptionCreate, _payload(**override)))
    assert message
    assert not ENGLISH_MARKERS.search(message)


@pytest.mark.parametrize(
    ("error", "expected"),
    [
        (
            {
                "type": "missing",
                "loc": ("body", "serviceName"),
                "msg": "Field required",
            },
            "Servis adı alanı zorunludur.",
        ),
        (
            {"type": "json_invalid", "loc": ("body", 12), "msg": "JSON decode error"},
            "İstek gövdesi geçerli bir JSON değil.",
        ),
        (
            {"type": "missing", "loc": ("body",), "msg": "Field required"},
            "İstek gövdesi zorunludur.",
        ),
        (
            {"type": "model_attributes_type", "loc": ("body",), "msg": "Input ..."},
            "İstek gövdesi bir JSON nesnesi olmalıdır.",
        ),
        (
            {"type": "uuid_parsing", "loc": ("path", "id"), "msg": "Input ..."},
            "Abonelik kimliği geçerli bir UUID olmalıdır.",
        ),
        (
            {"type": "something_new", "loc": ("body", "period"), "msg": "English"},
            "Periyot geçersiz.",
        ),
        ({"type": "something_new", "loc": (), "msg": "English"}, GENERIC_MESSAGE),
    ],
)
def test_fastapi_locations_and_unknown_types(error, expected):
    assert translate_error(error) == expected


def test_domain_rule_messages_pass_through_unchanged():
    error = {
        "type": "domain_rule",
        "loc": ("body", "email"),
        "msg": "E-posta en fazla 254 karakter olabilir.",
    }
    assert translate_error(error) == "E-posta en fazla 254 karakter olabilir."


def test_only_first_error_is_reported_and_empty_list_is_generic():
    errors = [
        {"type": "missing", "loc": ("body", "period")},
        {"type": "missing", "loc": ("body", "startDate")},
    ]
    assert translate_errors(errors) == "Periyot alanı zorunludur."
    assert translate_errors([]) == GENERIC_MESSAGE


@pytest.mark.parametrize(
    ("status_code", "detail"),
    [
        (404, "Not Found"),
        (405, "Method Not Allowed"),
        (401, "Unauthorized"),
        (404, None),
    ],
)
def test_default_english_http_details_become_turkish(status_code, detail):
    message = http_error_message(status_code, detail)
    assert message == HTTP_DEFAULT_MESSAGES[status_code]
    assert not ENGLISH_MARKERS.search(message)


def test_custom_http_detail_is_kept():
    assert http_error_message(404, "Abonelik bulunamadı.") == "Abonelik bulunamadı."


def test_unknown_status_uses_turkish_fallback():
    assert http_error_message(418, "I'm a Teapot") == "İstek işlenemedi."
