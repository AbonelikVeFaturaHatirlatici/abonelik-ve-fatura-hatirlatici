# Dosya: backend/app/infra/db_errors.py
"""Veritabanı hatalarından hangi kısıtın ihlal edildiğini okur (psycopg2)."""
from sqlalchemy.exc import IntegrityError


def violated_constraint(exc: IntegrityError) -> str | None:
    diag = getattr(exc.orig, "diag", None)
    return getattr(diag, "constraint_name", None)
