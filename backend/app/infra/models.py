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


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    subscriptions: Mapped[list["Subscription"]] = relationship(
        "Subscription", back_populates="user", cascade="all, delete-orphan"
    )


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = (
        CheckConstraint("amount_kurus > 0", name="chk_subscriptions_amount_positive"),
        CheckConstraint(
            "period IN ('monthly', 'yearly')", name="chk_subscriptions_period"
        ),
        CheckConstraint(
            "status IN ('active', 'cancelled')", name="chk_subscriptions_status"
        ),
        # 409 Çakışma Önleme: Aynı kullanıcıda aynı servis adı (küçük harf) ve periyotta yalnızca TEK aktif abonelik olabilir.
        Index(
            "uq_active_user_service_period",
            "user_id",
            func.lower(text("service_name")),
            "period",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
        # Kullanıcının aboneliklerini ve durumunu hızlı sorgulama
        Index("ix_subscriptions_user_status", "user_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    amount_kurus: Mapped[int] = mapped_column(Integer, nullable=False)
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active", server_default="active"
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
        "Reminder", back_populates="subscription", cascade="all, delete-orphan"
    )


class Reminder(Base):
    __tablename__ = "reminders"
    __table_args__ = (
        CheckConstraint("days_before IN (3, 1)", name="chk_reminders_days_before"),
        CheckConstraint(
            "status IN ('created', 'sent_mock')", name="chk_reminders_status"
        ),
        # Her yenileme ve gün öncesi için en fazla bir hatırlatma (çift gönderimi engelleme)
        UniqueConstraint(
            "subscription_id",
            "renewal_date",
            "days_before",
            name="uq_reminder_subscription_renewal_days",
        ),
        # Günlük cron araması için indeks
        Index("ix_reminders_remind_on_status", "remind_on", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
    )
    renewal_date: Mapped[date] = mapped_column(Date, nullable=False)
    days_before: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    remind_on: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="created", server_default="created"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    subscription: Mapped["Subscription"] = relationship(
        "Subscription", back_populates="reminders"
    )
