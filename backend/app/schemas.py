# Dosya: backend/app/schemas.py
"""Pydantic v2 istek/yanıt şemaları; api/openapi.yaml ile birebir.

- Sınıf adları sözleşmedeki bileşen adlarıyla aynıdır (Credentials, User, Token,
  SubscriptionCreate, Subscription, ReminderSummary, ReminderStatus, Reminder, Error),
  böylece FastAPI'nin ürettiği şema sözleşmeyle aynı adları taşır. ORM modelleriyle
  karışmaması için router/servis katmanında `from app import schemas` olarak kullanılır.
- Bu modül yalnızca `app.domain`'e bağımlıdır; `app.infra`'yı (veritabanı) içe aktarmaz.
- JSON'da sözleşmedeki camelCase adlar, Python'da snake_case adlar kullanılır.
- Doğrulama hataları app/infra/errors.py tarafından 400 VALIDATION_ERROR'a çevrilir.
- Zaman damgaları yanıtta her zaman UTC'ye çevrilir ("Z" sonekiyle yazılır).
"""

import uuid
from datetime import UTC, date, datetime
from enum import Enum
from typing import Annotated, Any, Literal

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)
from pydantic.alias_generators import to_camel
from pydantic_core import PydanticCustomError

from app.domain.renewal import Period
from app.domain.rules import (
    SERVICE_NAME_MAX_LENGTH,
    DomainValidationError,
    normalize_email,
    normalize_service_name,
    validate_amount_kurus,
)


def _domain_error(exc: DomainValidationError) -> PydanticCustomError:
    # errors.py mesajı "<mesaj> (body.<alan>)" biçiminde yazar.
    return PydanticCustomError("domain_rule", exc.message)


def _to_utc(value: datetime) -> datetime:
    """timestamptz değerini UTC'ye çevirir; saat dilimsiz değer UTC kabul edilir."""
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


UtcDatetime = Annotated[datetime, AfterValidator(_to_utc)]
DaysBefore = Literal[3, 1]
SubscriptionStatus = Literal["active", "cancelled"]


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class ReminderStatus(str, Enum):
    """created = üretildi, sent_mock = mock bildirim gönderildi"""

    CREATED = "created"
    SENT_MOCK = "sent_mock"


class Error(ApiModel):
    code: str = Field(
        description="Makine tarafından okunur hata kodu", examples=["VALIDATION_ERROR"]
    )
    message: str = Field(description="Kullanıcıya gösterilebilir açıklama")


class Credentials(ApiModel):
    email: EmailStr = Field(examples=["ayse@example.com"])
    password: str = Field(
        min_length=8,
        description="En az 8 karakter",
        json_schema_extra={"format": "password"},
    )

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, value: str) -> str:
        # Ekip kararı: e-posta harf duyarsız; kayıt ve giriş aynı biçimi kullanır.
        return normalize_email(value)


class User(ApiModel):
    id: uuid.UUID
    email: EmailStr
    created_at: UtcDatetime


class Token(ApiModel):
    access_token: str = Field(description="JWT")
    # Sözleşmede zorunlu olduğu için varsayılan verilmez; servis "bearer" yazar.
    token_type: Literal["bearer"]


class SubscriptionCreate(ApiModel):
    service_name: str = Field(
        min_length=1, max_length=SERVICE_NAME_MAX_LENGTH, examples=["Netflix"]
    )
    amount_kurus: int = Field(
        strict=True,  # 229.99, "22999" veya true tamsayıya zorlanmaz, reddedilir
        description="Tutar kuruş cinsinden (229,99 TL için 22999). Sıfır ve negatif reddedilir.",
        examples=[22999],
        # Yalnızca sözleşmedeki `minimum` yayımlanır; üst sınır sözleşmeye eklenmeden
        # app.domain.rules içinde uygulanır (ekip kararı).
        json_schema_extra={"minimum": 1},
    )
    period: Period
    start_date: date = Field(
        description="Yenileme hesabının başlangıç tarihi",
        examples=["2026-01-31"],
    )

    @field_validator("start_date", mode="before")
    @classmethod
    def validate_start_date_string(cls, value: Any) -> Any:
        # Sayı (unix timestamp vb.) gelirse sözleşme gereği doğrudan reddet
        if not isinstance(value, str):
            raise PydanticCustomError(
                "date_from_datetime_inexact",
                "Input should be a valid date",
            )
        return value

    @field_validator("service_name", mode="before")
    @classmethod
    def strip_service_name(cls, value: Any) -> Any:
        # Uzunluk kontrolü kırpılmış değere uygulanır; metin olmayan değer tip hatasına bırakılır.
        if not isinstance(value, str):
            return value
        try:
            return normalize_service_name(value)
        except DomainValidationError as exc:
            raise _domain_error(exc) from exc

    @field_validator("amount_kurus")
    @classmethod
    def check_amount(cls, value: int) -> int:
        try:
            return validate_amount_kurus(value)
        except DomainValidationError as exc:
            raise _domain_error(exc) from exc


class ReminderSummary(ApiModel):
    days_before: DaysBefore
    remind_on: date
    status: ReminderStatus


class Subscription(ApiModel):
    id: uuid.UUID
    service_name: str
    amount_kurus: int = Field(ge=1)
    # Sözleşmede zorunlu olduğu için varsayılan verilmez; from_record "TRY" yazar.
    currency: Literal["TRY"]
    period: Period
    start_date: date
    next_renewal_date: date = Field(
        description="Bir sonraki yenileme günü (başlangıç tarihinden hesaplanır)"
    )
    status: SubscriptionStatus
    reminders: list[ReminderSummary] = Field(
        description="Bu aboneliğin salt okunur hatırlatmaları"
    )
    created_at: UtcDatetime
    cancelled_at: UtcDatetime | None = None

    @classmethod
    def from_record(cls, record: Any, next_renewal_date: date) -> "Subscription":
        """ORM kaydını yanıta eşler; hesaplama yapmaz.

        `next_renewal_date` servis katmanında `app.domain.renewal.next_renewal` ile
        hesaplanıp verilir. `record.reminders` önceden yüklenmiş olmalıdır (selectinload).
        """
        return cls(
            id=record.id,
            service_name=record.service_name,
            amount_kurus=record.amount_kurus,
            currency="TRY",
            period=record.period,
            start_date=record.start_date,
            next_renewal_date=next_renewal_date,
            status=record.status,
            reminders=[ReminderSummary.model_validate(r) for r in record.reminders],
            created_at=record.created_at,
            cancelled_at=record.cancelled_at,
        )


class Reminder(ApiModel):
    id: uuid.UUID
    subscription_id: uuid.UUID
    renewal_date: date
    days_before: DaysBefore
    remind_on: date
    status: ReminderStatus
    created_at: UtcDatetime


__all__ = [
    "Credentials",
    "Error",
    "Period",
    "Reminder",
    "ReminderStatus",
    "ReminderSummary",
    "Subscription",
    "SubscriptionCreate",
    "Token",
    "User",
]
