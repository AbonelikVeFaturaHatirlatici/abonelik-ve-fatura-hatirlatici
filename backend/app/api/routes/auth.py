# Dosya: backend/app/api/routes/auth.py
from typing import Annotated

from fastapi import APIRouter, Body, status

from app import schemas
from app.api.deps import DbSession
from app.api.openapi_meta import REGISTER_EXAMPLES
from app.api.responses import EMAIL_CONFLICT, INVALID_LOGIN, VALIDATION_ERROR
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    operation_id="registerUser",
    summary="Yeni hesap oluşturur",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.User,
    response_description="Hesap oluşturuldu",
    responses={400: VALIDATION_ERROR, 409: EMAIL_CONFLICT},
)
def register_user(
    body: Annotated[schemas.Credentials, Body(openapi_examples=REGISTER_EXAMPLES)],
    db: DbSession,
) -> schemas.User:
    user = auth_service.register_user(db, body)
    return schemas.User.model_validate(user)


@router.post(
    "/login",
    operation_id="login",
    summary="E-posta ve şifre ile giriş yapar, JWT döndürür",
    response_model=schemas.Token,
    response_description="Giriş başarılı",
    responses={400: VALIDATION_ERROR, 401: INVALID_LOGIN},
)
def login(body: schemas.Credentials, db: DbSession) -> schemas.Token:
    return auth_service.login(db, body)