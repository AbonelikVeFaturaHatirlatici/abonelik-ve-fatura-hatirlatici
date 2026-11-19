# Dosya: backend/app/infra/models.py
"""SQLAlchemy 2.0 ORM modelleri (senkron).

Sözleşmedeki (api/openapi.yaml) varlıklar: User, Subscription, Reminder.
Sözleşmede ödeme/fatura varlığı yoktur ve AGENTS.md bölüm 2'ye göre kapsam dışıdır.

- Zaman damgaları `timestamptz` sütunlarındadır; PostgreSQL bunları UTC olarak saklar.
- Saatsiz tarihler (`start_date`, `renewal_date`, `remind_on`) Europe/Istanbul takvimine
  göre yorumlanan `date` değerleridir.
- Tutar kuruş cinsinden tamsayıdır; para birimi yalnızca TRY olduğundan sütun tutulmaz.
- Tüm kısıt, indeks ve yabancı anahtar adları açıkça verilmiştir; Alembic autogenerate
  her ortamda aynı adları üretir.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infra.db import Base

SUBSCRIPTION_STATUS_ACTIVE = "active"
SUBSCRIPTION_STATUS_CANCELLED = "cancelled"
REMINDER_STATUS_CREATED = "created"
REMINDER_STATUS_SENT_MOCK = "sent_mock"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        # E-posta harf duyarsızdır: her zaman küçük harfle saklanır (app.domain.rules),
        # bu yüzden düz benzersiz kısıt harf duyarsız benzersizlik sağlar.
        UniqueConstraint("email", name="uq_users_email"),
        CheckConstraint("email = lower(email)", name="chk_users_email_lowercase"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    email: Mapped[str] = mapped_column(Text, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    subscriptions: Mapped[list["Subscription"]] = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<User id={self.id}>"


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = (
        CheckConstraint("amount_kurus > 0", name="chk_subscriptions_amount_positive"),
        # Üst sınır INTEGER tipinin kendisidir (2147483647); app.domain.rules ile aynı.
        CheckConstraint(
            "period IN ('monthly', 'yearly')", name="chk_subscriptions_period"
        ),
        CheckConstraint(
            "status IN ('active', 'cancelled')", name="chk_subscriptions_status"
        ),
        # Servis adı kırpılmış ve boş olmayan biçimde saklanır (app.domain.rules).
        CheckConstraint(
            "service_name = btrim(service_name) AND length(service_name) > 0",
            name="chk_subscriptions_service_name_trimmed",
        ),
        # cancelledAt yalnızca iptal edilmiş kayıtta dolu olur; aktif kayıtta her zaman null.
        CheckConstraint(
            "(status = 'cancelled') = (cancelled_at IS NOT NULL)",
            name="chk_subscriptions_cancelled_at_consistency",
        ),
        # 409 SUBSCRIPTION_ALREADY_ACTIVE: aynı kullanıcı + aynı servis adı (harf farkı önemsiz)
        # + aynı periyotta yalnızca TEK aktif kayıt. İptal edilenler kapsam dışında kalır,
        # böylece aynı servis yeniden eklenebilir.
        Index(
            "uq_active_user_service_period",
            "user_id",
            func.lower(text("service_name")),
            "period",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
        # Kullanıcının aboneliklerini listeleme; user_id yabancı anahtarını da kapsar.
        Index("ix_subscriptions_user_status", "user_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_subscriptions_user_id"),
        nullable=False,
    )
    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    amount_kurus: Mapped[int] = mapped_column(Integer, nullable=False)
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=SUBSCRIPTION_STATUS_ACTIVE,
        server_default=SUBSCRIPTION_STATUS_ACTIVE,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="subscriptions")
    reminders: Mapped[list["Reminder"]] = relationship(
        "Reminder",
        back_populates="subscription",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by=lambda: [Reminder.remind_on.asc()],
    )

    @property
    def is_active(self) -> bool:
        return self.status == SUBSCRIPTION_STATUS_ACTIVE

    def __repr__(self) -> str:
        return (
            f"<Subscription id={self.id} service={self.service_name!r} "
            f"period={self.period} status={self.status}>"
        )


class Reminder(Base):
    __tablename__ = "reminders"
    __table_args__ = (
        CheckConstraint("days_before IN (3, 1)", name="chk_reminders_days_before"),
        CheckConstraint(
            "status IN ('created', 'sent_mock')", name="chk_reminders_status"
        ),
        # remind_on her zaman renewal_date - days_before'dur (PostgreSQL: date - integer = date).
        CheckConstraint(
            "remind_on = renewal_date - days_before",
            name="chk_reminders_remind_on_matches",
        ),
        # AGENTS.md 3: çift üretim bu benzersiz kısıtla engellenir.
        # İlk sütun subscription_id olduğu için yabancı anahtar sorgularını da kapsar.
        UniqueConstraint(
            "subscription_id",
            "renewal_date",
            "days_before",
            name="uq_reminder_subscription_renewal_days",
        ),
        # 09:00 zamanlayıcısının "bugün gönderilecek, henüz gönderilmemiş" araması için.
        Index("ix_reminders_remind_on_status", "remind_on", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "subscriptions.id",
            ondelete="CASCADE",
            name="fk_reminders_subscription_id",
        ),
        nullable=False,
    )
    renewal_date: Mapped[date] = mapped_column(Date, nullable=False)
    days_before: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    remind_on: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=REMINDER_STATUS_CREATED,
        server_default=REMINDER_STATUS_CREATED,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    subscription: Mapped["Subscription"] = relationship(
        "Subscription", back_populates="reminders"
    )

    def __repr__(self) -> str:
        return (
            f"<Reminder id={self.id} subscription_id={self.subscription_id} "
            f"renewal={self.renewal_date} days_before={self.days_before} "
            f"status={self.status}>"
        )
