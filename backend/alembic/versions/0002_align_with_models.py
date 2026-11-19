"""Align schema with models: e-posta/servis adı kuralları, tutarlılık kısıtları, FK adları

Revision ID: 0002_align_with_models
Revises: 0001_initial_schema
Create Date: 2026-10-28

0001'den sonra models.py'ye eklenenler (autogenerate bunların çoğunu GÖREMEZ:
var olan tabloya eklenen CHECK kısıtları ve yalnızca adı değişen FK'ler algılanmaz):

- users: ix_users_email (unique index) -> uq_users_email (unique constraint),
  chk_users_email_lowercase; mevcut e-postalar küçük harfe çevrilir.
- subscriptions: chk_subscriptions_service_name_trimmed,
  chk_subscriptions_cancelled_at_consistency; mevcut servis adları kırpılır.
- reminders: chk_reminders_remind_on_matches.
- FK adları: <tablo>_<sütun>_fkey -> fk_subscriptions_user_id, fk_reminders_subscription_id.
- Üç tablonun id sütununa server_default gen_random_uuid() (PostgreSQL 13+ yerleşik).

Veriyi sessizce bozmamak için önce kontroller çalışır; düzeltilemeyecek bir kayıt varsa
migration açıklayıcı bir hatayla durur ve PostgreSQL işlemi tamamen geri alır.
Veritabanına bağlanmayı gerektirdiği için `--sql` (offline) kipinde çalıştırılamaz.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_align_with_models"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

UUID_PK_TABLES = ("users", "subscriptions", "reminders")

# (tablo, sütun, modeldeki ad, PostgreSQL'in 0001'de verdiği varsayılan ad)
FOREIGN_KEYS = (
    ("subscriptions", "user_id", "fk_subscriptions_user_id", "subscriptions_user_id_fkey"),
    (
        "reminders",
        "subscription_id",
        "fk_reminders_subscription_id",
        "reminders_subscription_id_fkey",
    ),
)

PRECHECKS = (
    (
        """
        SELECT count(*) FROM (
            SELECT lower(btrim(email)) FROM users GROUP BY 1 HAVING count(*) > 1
        ) AS d
        """,
        (
            "Küçük harfe çevrildiğinde çakışan {count} e-posta grubu var; "
            "hangi hesabın kalacağına karar verip fazlalarını silin."
        ),
    ),
    (
        "SELECT count(*) FROM subscriptions WHERE btrim(service_name) = ''",
        "Servis adı yalnızca boşluktan oluşan {count} abonelik var; adlarını düzeltin.",
    ),
    (
        """
        SELECT count(*) FROM (
            SELECT user_id, lower(btrim(service_name)), period
            FROM subscriptions WHERE status = 'active'
            GROUP BY 1, 2, 3 HAVING count(*) > 1
        ) AS d
        """,
        (
            "Servis adları kırpıldığında çakışan {count} aktif abonelik grubu var; "
            "fazlalarını iptal edin."
        ),
    ),
    (
        """
        SELECT count(*) FROM subscriptions
        WHERE (status = 'cancelled') <> (cancelled_at IS NOT NULL)
        """,
        (
            "status ile cancelled_at tutarsız {count} abonelik var "
            "(iptal edilmiş ama cancelled_at boş ya da aktif ama dolu)."
        ),
    ),
    (
        "SELECT count(*) FROM reminders WHERE remind_on <> renewal_date - days_before",
        "remind_on değeri renewal_date - days_before ile uyuşmayan {count} hatırlatma var.",
    ),
)


def _run_prechecks() -> None:
    bind = op.get_bind()
    for sql, message in PRECHECKS:
        count = bind.execute(sa.text(sql)).scalar_one()
        if count:
            detail = message.format(count=count)
            raise RuntimeError(f"0002_align_with_models uygulanamadı: {detail}")


def _foreign_key_name(table: str, column: str) -> str:
    """İlgili sütundaki FK'nin veritabanındaki gerçek adı."""
    return op.get_bind().execute(
        sa.text(
            """
            SELECT c.conname
            FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
            WHERE c.contype = 'f'
              AND c.conrelid = to_regclass(:table)
              AND a.attname = :column
            """
        ),
        {"table": table, "column": column},
    ).scalar_one()


def _rename_foreign_key(table: str, column: str, new_name: str) -> None:
    current = _foreign_key_name(table, column)
    if current != new_name:
        op.execute(f'ALTER TABLE {table} RENAME CONSTRAINT "{current}" TO "{new_name}"')


def upgrade() -> None:
    _run_prechecks()

    # Mevcut veriyi yeni kurallara getir (kontroller çakışma olmadığını doğruladı).
    op.execute("UPDATE users SET email = lower(btrim(email)) WHERE email <> lower(btrim(email))")
    op.execute(
        "UPDATE subscriptions SET service_name = btrim(service_name) "
        "WHERE service_name <> btrim(service_name)"
    )

    # users
    op.drop_index("ix_users_email", table_name="users")
    op.create_unique_constraint("uq_users_email", "users", ["email"])
    op.create_check_constraint("chk_users_email_lowercase", "users", "email = lower(email)")

    # subscriptions
    op.create_check_constraint(
        "chk_subscriptions_service_name_trimmed",
        "subscriptions",
        "service_name = btrim(service_name) AND length(service_name) > 0",
    )
    op.create_check_constraint(
        "chk_subscriptions_cancelled_at_consistency",
        "subscriptions",
        "(status = 'cancelled') = (cancelled_at IS NOT NULL)",
    )

    # reminders
    op.create_check_constraint(
        "chk_reminders_remind_on_matches",
        "reminders",
        "remind_on = renewal_date - days_before",
    )

    # Yabancı anahtar adları
    for table, column, model_name, _default_name in FOREIGN_KEYS:
        _rename_foreign_key(table, column, model_name)

    # UUID birincil anahtarları için sunucu tarafı varsayılan
    for table in UUID_PK_TABLES:
        op.alter_column(table, "id", server_default=sa.text("gen_random_uuid()"))


def downgrade() -> None:
    # Not: küçük harfe çevrilen e-postalar ve kırpılan servis adları geri alınamaz.
    for table in UUID_PK_TABLES:
        op.alter_column(table, "id", server_default=None)

    for table, column, _model_name, default_name in FOREIGN_KEYS:
        _rename_foreign_key(table, column, default_name)

    op.drop_constraint("chk_reminders_remind_on_matches", "reminders", type_="check")
    op.drop_constraint(
        "chk_subscriptions_cancelled_at_consistency", "subscriptions", type_="check"
    )
    op.drop_constraint("chk_subscriptions_service_name_trimmed", "subscriptions", type_="check")

    op.drop_constraint("chk_users_email_lowercase", "users", type_="check")
    op.drop_constraint("uq_users_email", "users", type_="unique")
    op.create_index("ix_users_email", "users", ["email"], unique=True)
