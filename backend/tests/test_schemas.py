import uuid
from datetime import UTC, date, datetime
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.domain.renewal import Period
from app.schemas import (
    Credentials,
    Error,
    Reminder,
    ReminderStatus,
    ReminderSummary,
    Subscription,
    SubscriptionCreate,
    Token,
    User,
)


def test_credentials_normalizes_email() -> None:
    cred = Credentials(email="  Ayse@Example.COM ", password="secret123")
    assert cred.email == "ayse@example.com"


def test_subscription_create_valid_and_trims_service_name() -> None:
    payload = SubscriptionCreate(
        serviceName="  Netflix  ",
        amountKurus=22999,
        period=Period.MONTHLY,
        startDate="2026-01-31",
    )
    assert payload.service_name == "Netflix"
    assert payload.amount_kurus == 22999
    assert payload.start_date == date(2026, 1, 31)


@pytest.mark.parametrize(
    "kwargs",
    [
        {
            "serviceName": "   ",
            "amountKurus": 1000,
            "period": "monthly",
            "startDate": "2026-01-01",
        },
        {
            "serviceName": "Spotify",
            "amountKurus": 0,
            "period": "monthly",
            "startDate": "2026-01-01",
        },
        {
            "serviceName": "Spotify",
            "amountKurus": "1000",
            "period": "monthly",
            "startDate": "2026-01-01",
        },
        {
            "serviceName": "Spotify",
            "amountKurus": 1000,
            "period": "monthly",
            "startDate": 1700000000,
        },
    ],
)
def test_subscription_create_rejects_invalid_inputs(kwargs: dict) -> None:
    with pytest.raises(ValidationError):
        SubscriptionCreate(**kwargs)


def test_subscription_from_record_and_utc_conversion() -> None:
    sub_id = uuid.uuid4()
    naive_created = datetime(2026, 1, 10, 12, 0, 0)
    aware_cancelled = datetime(2026, 2, 10, 15, 0, 0, tzinfo=UTC)
    record = SimpleNamespace(
        id=sub_id,
        service_name="YouTube Premium",
        amount_kurus=7999,
        period=Period.MONTHLY,
        start_date=date(2026, 1, 10),
        status="active",
        reminders=[
            SimpleNamespace(
                days_before=3,
                remind_on=date(2026, 2, 7),
                status=ReminderStatus.CREATED,
            )
        ],
        created_at=naive_created,
        cancelled_at=aware_cancelled,
    )

    sub = Subscription.from_record(record, next_renewal_date=date(2026, 2, 10))
    assert sub.id == sub_id
    assert sub.currency == "TRY"
    assert sub.created_at.tzinfo == UTC
    assert sub.cancelled_at == aware_cancelled
    assert len(sub.reminders) == 1
    assert sub.reminders[0] == ReminderSummary(
        days_before=3,
        remind_on=date(2026, 2, 7),
        status=ReminderStatus.CREATED,
    )


def test_other_response_models() -> None:
    now = datetime(2026, 3, 1, 9, 30, tzinfo=UTC)
    user = User(id=uuid.uuid4(), email="test@example.com", created_at=now)
    token = Token(access_token="jwt-token", token_type="bearer")
    err = Error(code="VALIDATION_ERROR", message="Geçersiz istek")
    rem = Reminder(
        id=uuid.uuid4(),
        subscription_id=uuid.uuid4(),
        renewal_date=date(2026, 4, 1),
        days_before=1,
        remind_on=date(2026, 3, 31),
        status=ReminderStatus.SENT_MOCK,
        created_at=now,
    )
    assert user.email == "test@example.com"
    assert token.token_type == "bearer"
    assert err.code == "VALIDATION_ERROR"
    assert rem.days_before == 1


from app.domain.notifications import ReminderNotification


def test_reminder_notification_dataclass() -> None:
    notif = ReminderNotification(
        reminder_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        subscription_id=uuid.uuid4(),
        service_name="Netflix",
        amount_kurus=22999,
        renewal_date=date(2026, 4, 1),
        days_before=3,
    )
    assert notif.service_name == "Netflix"
    assert notif.days_before == 3
