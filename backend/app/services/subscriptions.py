# Dosya: backend/app/services/subscriptions.py
"""Abonelik takip listesi iş akışı (senkron oturum).

Başkasına ait kayıt her sorguda `user_id` filtresiyle elenir ve 404 döner (403 değil).
"""

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app import schemas
from app.domain.renewal import Period, next_renewal
from app.domain.rules import (
    DomainValidationError,
    normalize_service_name,
    validate_amount_kurus,
)
from app.infra.clock import now_utc
from app.infra.db_errors import violated_constraint
from app.infra.errors import ConflictError, NotFoundError, ValidationError
from app.infra.models import (
    SUBSCRIPTION_STATUS_ACTIVE,
    SUBSCRIPTION_STATUS_CANCELLED,
    Subscription,
)

SUBSCRIPTION_ALREADY_ACTIVE = (
    "SUBSCRIPTION_ALREADY_ACTIVE",
    "Bu servis ve periyot için aktif bir abonelik zaten var.",
)
ALREADY_CANCELLED = ("ALREADY_CANCELLED", "Bu abonelik zaten iptal edilmiş.")


def _already_active() -> ConflictError:
    code, message = SUBSCRIPTION_ALREADY_ACTIVE
    return ConflictError(message=message, code=code)


def to_response(subscription: Subscription, today: date) -> schemas.Subscription:
    """Yanıt modeli; nextRenewalDate başlangıç tarihinden, `today` sonrası ilk yenilemedir."""
    renewal = next_renewal(subscription.start_date, Period(subscription.period), today)
    return schemas.Subscription.from_record(subscription, next_renewal_date=renewal)


def list_subscriptions(db: Session, user_id: uuid.UUID) -> list[Subscription]:
    stmt = (
        select(Subscription)
        .where(Subscription.user_id == user_id)
        .options(selectinload(Subscription.reminders))
        .order_by(Subscription.created_at.desc(), Subscription.id)
    )
    return list(db.scalars(stmt))


def get_subscription(
    db: Session, user_id: uuid.UUID, subscription_id: uuid.UUID
) -> Subscription:
    stmt = (
        select(Subscription)
        .where(Subscription.id == subscription_id, Subscription.user_id == user_id)
        .options(selectinload(Subscription.reminders))
    )
    subscription = db.scalar(stmt)
    if subscription is None:
        raise NotFoundError()
    return subscription


def create_subscription(
    db: Session, user_id: uuid.UUID, data: schemas.SubscriptionCreate, today: date
) -> Subscription:
    # Şema zaten doğruladı; domain kuralları HTTP dışı çağrılar için burada da uygulanır.
    try:
        service_name = normalize_service_name(data.service_name)
        amount_kurus = validate_amount_kurus(data.amount_kurus)
    except DomainValidationError as exc:
        raise ValidationError(exc.message) from exc

    existing = db.scalar(
        select(Subscription.id).where(
            Subscription.user_id == user_id,
            func.lower(Subscription.service_name) == func.lower(service_name),
            Subscription.period == data.period.value,
            Subscription.status == SUBSCRIPTION_STATUS_ACTIVE,
        )
    )
    if existing is not None:
        raise _already_active()

    subscription = Subscription(
        user_id=user_id,
        service_name=service_name,
        amount_kurus=amount_kurus,
        period=data.period.value,
        start_date=data.start_date,
        status=SUBSCRIPTION_STATUS_ACTIVE,
    )

    db.add(subscription)
    try:
        db.commit()
    except IntegrityError as exc:
        # Eşzamanlı iki ekleme: ikincisi kısmi benzersiz indekse takılır.
        db.rollback()
        if violated_constraint(exc) == "uq_active_user_service_period":
            raise _already_active() from exc
        raise
    return get_subscription(db, user_id, subscription.id)


def cancel_subscription(
    db: Session, user_id: uuid.UUID, subscription_id: uuid.UUID
) -> Subscription:
    """Yalnızca takibi sonlandırır; eski hatırlatmalar kalır, yenileri üretilmez."""
    subscription = db.scalar(
        select(Subscription)
        .where(Subscription.id == subscription_id, Subscription.user_id == user_id)
        .with_for_update()
    )
    if subscription is None:
        raise NotFoundError()
    if subscription.status == SUBSCRIPTION_STATUS_CANCELLED:
        db.rollback()
        code, message = ALREADY_CANCELLED
        raise ConflictError(message=message, code=code)

    subscription.status = SUBSCRIPTION_STATUS_CANCELLED
    subscription.cancelled_at = now_utc()
    db.commit()
    return get_subscription(db, user_id, subscription_id)
