# Dosya: backend/app/api/deps.py
"""Router bağımlılıkları: veritabanı oturumu, oturum açmış kullanıcı, bugünün tarihi."""

import uuid
from datetime import date
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.infra.clock import today_local
from app.infra.db import get_db
from app.infra.errors import NotFoundError, UnauthorizedError
from app.infra.models import User
from app.infra.security import InvalidTokenError, decode_access_token

UNAUTHORIZED_MESSAGE = "Geçerli bir oturum gerekli."

# Şema adı sözleşmedeki `bearerAuth` ile aynı. auto_error=False: eksik başlıkta FastAPI'nin
# kendi hatası yerine sözleşmedeki 401 UNAUTHORIZED gövdesi döner.
bearer_scheme = HTTPBearer(
    scheme_name="bearerAuth", bearerFormat="JWT", auto_error=False
)

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    if credentials is None:
        raise UnauthorizedError(UNAUTHORIZED_MESSAGE)
    try:
        user_id = decode_access_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise UnauthorizedError(UNAUTHORIZED_MESSAGE) from exc
    user = db.get(User, user_id)
    if user is None:
        raise UnauthorizedError(UNAUTHORIZED_MESSAGE)
    return user


def get_today() -> date:
    """Europe/Istanbul takvimine göre bugün; testlerde dependency_overrides ile sabitlenir."""
    return today_local()


def parse_subscription_id(raw_id: str) -> uuid.UUID:
    """Sözleşme bu uçlarda 400 tanımlamaz: biçimi bozuk kimlik, bulunamayan kayıt sayılır."""
    try:
        return uuid.UUID(raw_id)
    except ValueError as exc:
        raise NotFoundError() from exc


CurrentUser = Annotated[User, Depends(get_current_user)]
Today = Annotated[date, Depends(get_today)]
