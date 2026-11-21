"""Düzeltme 1 ve 3 (HTTP): hata yanıtları `{code, message}`, mesajlar Türkçe.

test_infra.py'deki gibi küçük bir test uygulaması kullanılır; veritabanı gerekmez.
"""

import re
from datetime import date

from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic.alias_generators import to_camel
from pydantic_core import PydanticCustomError

from app.domain.renewal import Period
from app.domain.rules import (
    EMAIL_TOO_LONG_MESSAGE,
    START_DATE_RANGE_MESSAGE,
    DomainValidationError,
    validate_email_length,
    validate_start_date,
)
from app.infra.errors import ValidationError, register_error_handlers

TODAY = date(2026, 2, 27)

ENGLISH_MARKERS = re.compile(
    r"Input should|Field required|String should|value is not|valid integer|"
    r"Not Found|Method Not Allowed|JSON decode|body\.|\(body",
    re.IGNORECASE,
)


class CredentialsIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("email", mode="before")
    @classmethod
    def check_length(cls, value):
        # Şemaların e-posta sınırını nasıl uygulayacağının örneği (biçimden önce çalışır).
        if isinstance(value, str):
            try:
                validate_email_length(value)
            except DomainValidationError as exc:
                raise PydanticCustomError("domain_rule", exc.message) from exc
        return value


class SubscriptionIn(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    service_name: str = Field(min_length=1, max_length=100)
    amount_kurus: int = Field(strict=True, ge=1)
    period: Period
    start_date: date


def create_test_app() -> FastAPI:
    test_app = FastAPI()
    register_error_handlers(test_app)

    @test_app.post("/auth/register")
    def register(body: CredentialsIn) -> dict[str, str]:
        return {"email": body.email}

    @test_app.post("/subscriptions")
    def create(body: SubscriptionIn) -> dict[str, str]:
        # Tarih aralığı "bugün"e bağlı olduğu için servis katmanında denetlenir.
        try:
            validate_start_date(body.start_date, TODAY)
        except DomainValidationError as exc:
            raise ValidationError(exc.message) from exc
        return {"startDate": body.start_date.isoformat()}

    @test_app.get("/reminders")
    def reminders() -> list[str]:
        return []

    return test_app


client = TestClient(create_test_app())


def _payload(**overrides):
    payload = {
        "serviceName": "Netflix",
        "amountKurus": 22999,
        "period": "monthly",
        "startDate": "2026-01-31",
    }
    payload.update(overrides)
    return payload


def _turkish_error(response, status_code, code):
    assert response.status_code == status_code
    body = response.json()
    assert set(body) == {"code", "message"}
    assert body["code"] == code
    assert body["message"]
    assert not ENGLISH_MARKERS.search(body["message"])
    return body["message"]


def test_valid_request_still_succeeds():
    response = client.post("/subscriptions", json=_payload())
    assert response.status_code == 200
    assert response.json() == {"startDate": "2026-01-31"}


def test_wrong_type_is_400_and_turkish():
    response = client.post("/subscriptions", json=_payload(amountKurus="abc"))
    message = _turkish_error(response, 400, "VALIDATION_ERROR")
    assert message == "Tutar tamsayı olmalıdır."


def test_missing_field_is_400_and_turkish():
    payload = _payload()
    del payload["serviceName"]
    response = client.post("/subscriptions", json=payload)
    message = _turkish_error(response, 400, "VALIDATION_ERROR")
    assert message == "Servis adı alanı zorunludur."


def test_unsupported_period_is_400_and_turkish():
    response = client.post("/subscriptions", json=_payload(period="weekly"))
    message = _turkish_error(response, 400, "VALIDATION_ERROR")
    assert (
        message == "Periyot yalnızca şu değerlerden biri olabilir: monthly veya yearly."
    )


def test_invalid_json_is_400_and_turkish():
    response = client.post(
        "/subscriptions",
        content=b"{bozuk json",
        headers={"Content-Type": "application/json"},
    )
    message = _turkish_error(response, 400, "VALIDATION_ERROR")
    assert message == "İstek gövdesi geçerli bir JSON değil."


def test_short_password_is_400_and_turkish():
    response = client.post(
        "/auth/register", json={"email": "ayse@example.com", "password": "kisa"}
    )
    message = _turkish_error(response, 400, "VALIDATION_ERROR")
    assert message == "Şifre en az 8 karakter olmalıdır."


def test_email_longer_than_254_is_400_and_turkish():
    email = "a" * (255 - len("@example.com")) + "@example.com"
    response = client.post("/auth/register", json={"email": email, "password": "x" * 8})
    message = _turkish_error(response, 400, "VALIDATION_ERROR")
    assert message == EMAIL_TOO_LONG_MESSAGE


def test_start_date_outside_range_is_400_and_turkish():
    for start in ("1999-12-31", "2027-03-01"):
        response = client.post("/subscriptions", json=_payload(startDate=start))
        message = _turkish_error(response, 400, "VALIDATION_ERROR")
        assert message == START_DATE_RANGE_MESSAGE


def test_unknown_path_is_404_with_turkish_message():
    response = client.get("/boyle-bir-adres-yok")
    assert _turkish_error(response, 404, "NOT_FOUND") == "İstenen adres bulunamadı."


def test_undefined_method_is_405_with_allow_header_and_turkish_message():
    response = client.delete("/reminders")
    message = _turkish_error(response, 405, "HTTP_ERROR")
    assert message == "Bu adres bu HTTP yöntemini desteklemiyor."
    assert "GET" in response.headers["allow"]
