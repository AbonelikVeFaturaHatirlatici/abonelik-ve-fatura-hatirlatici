# Dosya: backend/app/services/auth.py
"""Kayıt ve giriş iş akışı (senkron oturum)."""
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import schemas
from app.domain.rules import normalize_email
from app.infra.db_errors import violated_constraint
from app.infra.errors import ConflictError, UnauthorizedError
from app.infra.models import User
from app.infra.security import (
    create_access_token,
    hash_password,
    password_needs_rehash,
    verify_password,
    verify_password_against_dummy,
)

EMAIL_ALREADY_REGISTERED = ("EMAIL_ALREADY_REGISTERED", "Bu e-posta ile kayıtlı bir hesap var.")
INVALID_CREDENTIALS = ("INVALID_CREDENTIALS", "E-posta veya şifre hatalı.")


def _email_conflict() -> ConflictError:
    code, message = EMAIL_ALREADY_REGISTERED
    return ConflictError(message=message, code=code)


def _invalid_credentials() -> UnauthorizedError:
    code, message = INVALID_CREDENTIALS
    return UnauthorizedError(message=message, code=code)


def register_user(db: Session, credentials: schemas.Credentials) -> User:
    email = normalize_email(credentials.email)
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise _email_conflict()

    user = User(email=email, password_hash=hash_password(credentials.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        # Aynı e-postayla eşzamanlı iki kayıt: ikincisi benzersiz kısıta takılır.
        db.rollback()
        if violated_constraint(exc) == "uq_users_email":
            raise _email_conflict() from exc
        raise
    db.refresh(user)
    return user


def login(db: Session, credentials: schemas.Credentials) -> schemas.Token:
    email = normalize_email(credentials.email)
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        verify_password_against_dummy(credentials.password)
        raise _invalid_credentials()
    if not verify_password(user.password_hash, credentials.password):
        raise _invalid_credentials()

    if password_needs_rehash(user.password_hash):
        user.password_hash = hash_password(credentials.password)
        db.commit()

    return schemas.Token(access_token=create_access_token(user.id), token_type="bearer")
