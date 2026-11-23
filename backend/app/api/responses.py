# Dosya: backend/app/api/responses.py
"""OpenAPI'de belgelenen hata yanıtları: tek `Error` şeması + sözleşmedeki örnekler.

Hata kodları ve mesajları, çalışma anında kullanılan sabitlerden alınır; dokümandaki
örnek ile API'nin gerçekten döndürdüğü kod hiçbir zaman birbirinden ayrışmaz.
"""

from typing import Any

from app import schemas
from app.api.deps import UNAUTHORIZED_MESSAGE
from app.services.auth import EMAIL_ALREADY_REGISTERED, INVALID_CREDENTIALS
from app.services.subscriptions import ALREADY_CANCELLED, SUBSCRIPTION_ALREADY_ACTIVE


def error_response(description: str, code: str, message: str) -> dict[str, Any]:
    return {
        "model": schemas.Error,
        "description": description,
        "content": {
            "application/json": {"example": {"code": code, "message": message}}
        },
    }


VALIDATION_ERROR = error_response(
    "Geçersiz girdi (eksik alan, biçim hatası, sıfır veya negatif tutar)",
    "VALIDATION_ERROR",
    "amountKurus sıfırdan büyük olmalıdır.",
)
UNAUTHORIZED = error_response(
    "Kimlik doğrulama eksik veya geçersiz", "UNAUTHORIZED", UNAUTHORIZED_MESSAGE
)
NOT_FOUND = error_response(
    "Kayıt bulunamadı (başkasına ait kayıtlar da bu yanıtı döndürür)",
    "NOT_FOUND",
    "Abonelik bulunamadı.",
)
EMAIL_CONFLICT = error_response("E-posta zaten kayıtlı", *EMAIL_ALREADY_REGISTERED)
INVALID_LOGIN = error_response("E-posta veya şifre hatalı", *INVALID_CREDENTIALS)
SUBSCRIPTION_CONFLICT = error_response(
    "Aynı servis ve periyotta aktif bir abonelik zaten var (servis adında harf farkı önemsiz)",
    *SUBSCRIPTION_ALREADY_ACTIVE,
)
CANCEL_CONFLICT = error_response("Abonelik zaten iptal edilmiş", *ALREADY_CANCELLED)
