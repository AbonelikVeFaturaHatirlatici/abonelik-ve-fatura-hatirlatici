# Dosya: backend/app/infra/security.py
"""Şifre özeti (argon2) ve JWT üretimi/doğrulaması."""

import uuid
from datetime import timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.infra.clock import now_utc
from app.infra.config import settings

JWT_ALGORITHM = "HS256"

_password_hasher = PasswordHasher()

# Olmayan kullanıcıyla girişte de bir argon2 doğrulaması yapılır; böylece yanıt süresi
# e-postanın kayıtlı olup olmadığını ele vermez.
_DUMMY_HASH = _password_hasher.hash("zamanlama-esitleme-icin-sabit-deger")


class InvalidTokenError(Exception):
    """Token eksik, süresi dolmuş, imzası geçersiz veya içeriği hatalı."""


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def verify_password_against_dummy(password: str) -> None:
    verify_password(_DUMMY_HASH, password)


def password_needs_rehash(password_hash: str) -> bool:
    return _password_hasher.check_needs_rehash(password_hash)


def create_access_token(user_id: uuid.UUID) -> str:
    issued_at = now_utc()
    payload = {
        "sub": str(user_id),
        "iat": issued_at,
        "exp": issued_at + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> uuid.UUID:
    """Geçerli token'daki kullanıcı kimliğini döndürür; aksi halde InvalidTokenError."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp", "iat", "sub"]},
        )
        return uuid.UUID(payload["sub"])
    except (jwt.InvalidTokenError, ValueError, TypeError) as exc:
        raise InvalidTokenError(str(exc)) from exc
