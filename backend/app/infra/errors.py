from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppException(Exception):
    def __init__(
        self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ValidationError(AppException):
    def __init__(self, message: str = "İstek gövdesi veya parametreler geçersiz."):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class UnauthorizedError(AppException):
    def __init__(
        self, message: str = "Oturum açmanız gerekiyor.", code: str = "UNAUTHORIZED"
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class NotFoundError(AppException):
    def __init__(self, message: str = "Abonelik bulunamadı.", code: str = "NOT_FOUND"):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ConflictError(AppException):
    def __init__(self, message: str, code: str):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_409_CONFLICT,
        )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # FastAPI'nin varsayılan 422 yanıtını sözleşmeye uygun 400 VALIDATION_ERROR'a dönüştür
        first_error = exc.errors()[0] if exc.errors() else None
        msg = "İstek gövdesi veya parametreler geçersiz."
        if first_error and "msg" in first_error:
            msg = f"{first_error['msg']} ({'.'.join(str(loc) for loc in first_error.get('loc', []))})"
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"code": "VALIDATION_ERROR", "message": msg},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        _: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        # 404, 405 vb. varsayılan Starlette HTTP hatalarını da tek şemaya uydur
        code = "HTTP_ERROR"
        if exc.status_code == status.HTTP_404_NOT_FOUND:
            code = "NOT_FOUND"
        elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
            code = "UNAUTHORIZED"
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            code = "FORBIDDEN"
        elif exc.status_code == status.HTTP_400_BAD_REQUEST:
            code = "BAD_REQUEST"

        return JSONResponse(
            status_code=exc.status_code,
            content={"code": code, "message": str(exc.detail)},
        )
