# Dosya: backend/app/domain/rules.py
"""Girdi kuralları. Saf fonksiyonlar: veritabanı ve web'e bağımlı değil.

Ekip kararları (Sprint 1):
- E-posta harf duyarsızdır; her yerde küçük harfe çevrilerek işlenir.
- Servis adının baş/son boşlukları kırpılır; kırpıldıktan sonra en az 1, en fazla
  100 karakter olmalıdır. Yalnızca boşluktan oluşan ad reddedilir.
- amountKurus 1 ile PostgreSQL INTEGER üst sınırı (2147483647) arasında olmalıdır.
"""

SERVICE_NAME_MAX_LENGTH = 100
AMOUNT_KURUS_MIN = 1
AMOUNT_KURUS_MAX = 2_147_483_647


class DomainValidationError(ValueError):
    """Bir alan iş kuralını sağlamadığında yükselir. `message` kullanıcıya gösterilebilir."""

    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(message)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_service_name(service_name: str) -> str:
    name = service_name.strip()
    if not name:
        raise DomainValidationError("serviceName", "serviceName boş olamaz.")
    if len(name) > SERVICE_NAME_MAX_LENGTH:
        raise DomainValidationError(
            "serviceName",
            f"serviceName en fazla {SERVICE_NAME_MAX_LENGTH} karakter olabilir.",
        )
    return name


def validate_amount_kurus(amount_kurus: int) -> int:
    if amount_kurus < AMOUNT_KURUS_MIN:
        raise DomainValidationError(
            "amountKurus", "amountKurus sıfırdan büyük olmalıdır."
        )
    if amount_kurus > AMOUNT_KURUS_MAX:
        raise DomainValidationError(
            "amountKurus", f"amountKurus en fazla {AMOUNT_KURUS_MAX} olabilir."
        )
    return amount_kurus
