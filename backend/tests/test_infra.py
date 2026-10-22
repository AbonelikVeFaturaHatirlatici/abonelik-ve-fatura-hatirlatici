from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

from app.infra.db import get_db, get_sqlalchemy_url
from app.infra.errors import (
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
    register_error_handlers,
)


class SampleInput(BaseModel):
    amount: int


def create_test_app() -> FastAPI:
    test_app = FastAPI()
    register_error_handlers(test_app)

    @test_app.post("/validate")
    def validate_endpoint(body: SampleInput) -> dict[str, int]:
        return {"amount": body.amount}

    @test_app.get("/unauthorized")
    def unauthorized_endpoint() -> None:
        raise UnauthorizedError()

    @test_app.get("/not-found")
    def not_found_endpoint() -> None:
        raise NotFoundError()

    @test_app.get("/conflict")
    def conflict_endpoint() -> None:
        raise ConflictError(code="DUPLICATE", message="Kayit zaten var.")

    @test_app.get("/custom-validation")
    def custom_validation_endpoint() -> None:
        raise ValidationError("Ozel dogrulama hatasi.")

    return test_app


def test_validation_error_returns_400_and_standard_schema():
    client = TestClient(create_test_app())
    response = client.post("/validate", json={"amount": "not-an-int"})
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "message" in data


def test_app_exceptions_return_expected_codes():
    client = TestClient(create_test_app())

    r_unauth = client.get("/unauthorized")
    assert r_unauth.status_code == 401
    assert r_unauth.json()["code"] == "UNAUTHORIZED"

    r_nf = client.get("/not-found")
    assert r_nf.status_code == 404
    assert r_nf.json()["code"] == "NOT_FOUND"

    r_conf = client.get("/conflict")
    assert r_conf.status_code == 409
    assert r_conf.json() == {"code": "DUPLICATE", "message": "Kayit zaten var."}

    r_val = client.get("/custom-validation")
    assert r_val.status_code == 400
    assert r_val.json() == {
        "code": "VALIDATION_ERROR",
        "message": "Ozel dogrulama hatasi.",
    }


def test_unmatched_route_returns_standard_404():
    client = TestClient(create_test_app())
    response = client.get("/non-existent-route")
    assert response.status_code == 404
    assert response.json()["code"] == "NOT_FOUND"


def test_get_sqlalchemy_url_normalizes_postgres_scheme():
    raw = "postgresql://user:pass@localhost:5432/db"
    assert (
        get_sqlalchemy_url(raw) == "postgresql+psycopg2://user:pass@localhost:5432/db"
    )
    sqlite_url = "sqlite:///:memory:"
    assert get_sqlalchemy_url(sqlite_url) == sqlite_url


def test_get_db_generator_closes_session():
    gen = get_db()
    session = next(gen)
    assert session is not None
    try:
        next(gen)
    except StopIteration:
        pass
