"""Initial schema: users, subscriptions, reminders

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users tablosu
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 2. subscriptions tablosu
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("service_name", sa.String(length=100), nullable=False),
        sa.Column("amount_kurus", sa.Integer(), nullable=False),
        sa.Column("period", sa.String(length=20), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount_kurus > 0", name="chk_subscriptions_amount_positive"),
        sa.CheckConstraint(
            "period IN ('monthly', 'yearly')", name="chk_subscriptions_period"
        ),
        sa.CheckConstraint(
            "status IN ('active', 'cancelled')", name="chk_subscriptions_status"
        ),
    )
    # Kısmi unique index: Yalnızca aktif aboneliklerde aynı kullanıcı + küçük harf servis adı + periyot tekil olmalı
    op.create_index(
        "uq_active_user_service_period",
        "subscriptions",
        ["user_id", sa.text("lower(service_name)"), "period"],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )
    op.create_index(
        "ix_subscriptions_user_status",
        "subscriptions",
        ["user_id", "status"],
    )

    # 3. reminders tablosu
    op.create_table(
        "reminders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "subscription_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("subscriptions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("renewal_date", sa.Date(), nullable=False),
        sa.Column("days_before", sa.SmallInteger(), nullable=False),
        sa.Column("remind_on", sa.Date(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="created",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "days_before IN (3, 1)", name="chk_reminders_days_before"
        ),
        sa.CheckConstraint(
            "status IN ('created', 'sent_mock')", name="chk_reminders_status"
        ),
        sa.UniqueConstraint(
            "subscription_id",
            "renewal_date",
            "days_before",
            name="uq_reminder_subscription_renewal_days",
        ),
    )
    op.create_index(
        "ix_reminders_remind_on_status",
        "reminders",
        ["remind_on", "status"],
    )


def downgrade() -> None:
    op.drop_table("reminders")
    op.drop_table("subscriptions")
    op.drop_table("users")
