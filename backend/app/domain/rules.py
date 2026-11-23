"""Girdi kuralları (sözleşme ve SRS). Saf fonksiyonlar: veritabanı ve web'e bağımlı değil.

- E-posta en fazla 254 karakterdir (`Credentials.email` maxLength, SRS 3.5.2).
- Başlangıç tarihi 2000-01-01 ile bugünden 366 gün sonrası arasındadır, iki uç da dahil
  (BR-10, `SubscriptionCreate.startDate`). "Bugün" Europe/Istanbul takvimindeki gündür
  ve çağrı yapan tarafından verilir; bu modül saate bakmaz.

İhlalde `DomainValidationError` yükselir; `message` kullanıcıya gösterilebilir Türkçe
metindir (D-19). API katmanı bunu 400 VALIDATION_ERROR olarak döndürür.
"""

from datetime import date, timedelta

EMAIL_MAX_LENGTH = 254
SERVICE_NAME_MAX_LENGTH = 100
AMOUNT_KURUS_MIN = 1
AMOUNT_KURUS_MAX = 100_000_000
START_DATE_MIN = date(2000, 1, 1)
START_DATE_MAX_DAYS_AHEAD = 366

EMAIL_TOO_LONG_MESSAGE = f"E-posta en fazla {EMAIL_MAX_LENGTH} karakter olabilir."
SERVICE_NAME_EMPTY_MESSAGE = "Hizmet adı boş olamaz."
SERVICE_NAME_TOO_LONG_MESSAGE = (
    f"Hizmet adı en fazla {SERVICE_NAME_MAX_LENGTH} karakter olabilir."
)
AMOUNT_RANGE_MESSAGE = (
    f"Tutar {AMOUNT_KURUS_MIN} ile {AMOUNT_KURUS_MAX} kuruş arasında olmalıdır."
)
START_DATE_RANGE_MESSAGE = (
    f"Başlangıç tarihi {START_DATE_MIN.isoformat()} ile bugünden itibaren "
    f"{START_DATE_MAX_DAYS_AHEAD} gün sonrası arasında olmalıdır."
)


class DomainValidationError(ValueError):
    """Bir alan iş kuralını sağlamadığında yükselir."""

    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(message)


def normalize_email(email: str) -> str:
    """E-postayı kırpar, küçük harfe çevirir ve uzunluk kuralını doğrular."""
    normalized = email.strip().lower()
    if len(normalized) > EMAIL_MAX_LENGTH:
        raise DomainValidationError("email", EMAIL_TOO_LONG_MESSAGE)
    return normalized


def validate_email_length(email: str) -> str:
    """E-postayı olduğu gibi döndürür; 254 karakteri aşarsa hata verir."""
    if len(email.strip()) > EMAIL_MAX_LENGTH:
        raise DomainValidationError("email", EMAIL_TOO_LONG_MESSAGE)
    return email


def normalize_service_name(service_name: str) -> str:
    """Hizmet adının başındaki/sonundaki boşlukları kırpar ve boş/uzunluk kuralını doğrular."""
    normalized = service_name.strip()
    if not normalized:
        raise DomainValidationError("serviceName", SERVICE_NAME_EMPTY_MESSAGE)
    if len(normalized) > SERVICE_NAME_MAX_LENGTH:
        raise DomainValidationError("serviceName", SERVICE_NAME_TOO_LONG_MESSAGE)
    return normalized


def validate_amount_kurus(amount_kurus: int) -> int:
    """Kuruş tutarının izin verilen aralıkta olduğunu doğrular."""
    if not AMOUNT_KURUS_MIN <= amount_kurus <= AMOUNT_KURUS_MAX:
        raise DomainValidationError("amountKurus", AMOUNT_RANGE_MESSAGE)
    return amount_kurus


def start_date_bounds(today: date) -> tuple[date, date]:
    """İzin verilen en erken ve en geç başlangıç tarihi (iki uç da dahil)."""
    return START_DATE_MIN, today + timedelta(days=START_DATE_MAX_DAYS_AHEAD)


def validate_start_date(start_date: date, today: date) -> date:
    """Başlangıç tarihini olduğu gibi döndürür; aralık dışındaysa hata verir."""
    earliest, latest = start_date_bounds(today)
    if not earliest <= start_date <= latest:
        raise DomainValidationError("startDate", START_DATE_RANGE_MESSAGE)
    return start_date
