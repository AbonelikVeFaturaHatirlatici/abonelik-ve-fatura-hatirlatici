"""Sözleşmedeki 7 işlemin tamamı uygulamada kayıtlı (main.py router regresyonu).

`main.py`'de `include_router` kayıtları kaybolduğunda yalnızca /health çalışıyor, 7 uç
404 dönüyordu. Bu testler iki yerden yakalar:
- `app.openapi()` çıktısında 7 `operationId` doğru path ve metotla bulunur,
- her uç gerçekten yönlendirilir (404 değil; korumalı uçlar token yokken 401 döner).
Veritabanı gerekmez: istekler kimlik doğrulama ya da gövde doğrulamasında sonlanır.
"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

# Sözleşmedeki işlemler: operationId -> (HTTP metodu, path)
EXPECTED_OPERATIONS: dict[str, tuple[str, str]] = {
    "registerUser": ("post", "/auth/register"),
    "login": ("post", "/auth/login"),
    "createSubscription": ("post", "/subscriptions"),
    "listSubscriptions": ("get", "/subscriptions"),
    "getSubscription": ("get", "/subscriptions/{id}"),
    "cancelSubscription": ("post", "/subscriptions/{id}/cancel"),
    "listReminders": ("get", "/reminders"),
}

CONTRACT_PATH = Path(__file__).resolve().parents[2] / "api" / "openapi.yaml"
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options"}


def _operations(document: dict) -> dict[str, tuple[str, str]]:
    found: dict[str, tuple[str, str]] = {}
    for path, item in document["paths"].items():
        for method, operation in item.items():
            if method in HTTP_METHODS and "operationId" in operation:
                found[operation["operationId"]] = (method, path)
    return found


@pytest.fixture(scope="module")
def generated() -> dict:
    app.openapi_schema = None
    return app.openapi()


def test_expected_list_matches_contract():
    """Testteki liste sözleşmeyle aynı (sözleşme dosyası varsa)."""
    yaml = pytest.importorskip("yaml")
    if not CONTRACT_PATH.exists():
        pytest.skip(f"sözleşme dosyası bulunamadı: {CONTRACT_PATH}")
    contract = yaml.safe_load(CONTRACT_PATH.read_text(encoding="utf-8"))
    assert _operations(contract) == EXPECTED_OPERATIONS


def test_all_seven_operation_ids_are_in_generated_openapi(generated):
    operation_ids = set(_operations(generated))
    missing = set(EXPECTED_OPERATIONS) - operation_ids
    assert not missing, f"app.openapi() içinde eksik operationId: {sorted(missing)}"
    assert len(EXPECTED_OPERATIONS) == 7


def test_operation_ids_have_contract_paths_and_methods(generated):
    found = _operations(generated)
    for operation_id, method_and_path in EXPECTED_OPERATIONS.items():
        assert found[operation_id] == method_and_path, operation_id


def test_generated_openapi_has_no_extra_operations(generated):
    # /health sözleşme dışıdır ve şemaya dahil edilmez (SRS 3.4.1).
    assert set(_operations(generated)) == set(EXPECTED_OPERATIONS)
    assert "/health" not in generated["paths"]


def test_generated_openapi_has_no_422_responses(generated):
    for item in generated["paths"].values():
        for method, operation in item.items():
            if method in HTTP_METHODS:
                assert "422" not in operation["responses"]


client = TestClient(app)  # `with` kullanılmaz: lifespan (zamanlayıcı) başlatılmaz.


@pytest.mark.parametrize(
    ("method", "url"),
    [
        ("get", "/subscriptions"),
        ("post", "/subscriptions"),
        ("get", "/subscriptions/00000000-0000-4000-a000-000000000000"),
        ("post", "/subscriptions/00000000-0000-4000-a000-000000000000/cancel"),
        ("get", "/reminders"),
    ],
)
def test_protected_endpoints_are_routed_and_require_token(method, url):
    response = client.request(method, url)
    assert response.status_code == 401, response.text
    assert response.json()["code"] == "UNAUTHORIZED"


@pytest.mark.parametrize("url", ["/auth/register", "/auth/login"])
def test_auth_endpoints_are_routed(url):
    # Boş gövde doğrulamada reddedilir; uç yoksa 404 dönerdi.
    response = client.post(url, json={})
    assert response.status_code == 400, response.text
    assert response.json()["code"] == "VALIDATION_ERROR"


def test_health_still_works():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
