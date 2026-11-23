"""OpenAPI üst bilgileri ve istek örnekleri api/openapi.yaml ile birebir aynı.

Metinlerin tek kaynağı `app.api.openapi_meta`'dır. Sözleşme repo kökündeki `api/`
klasöründedir; yalnızca `backend/` kopyalanmış bir ortamda (ör. Docker imajı)
sözleşmeye bakan testler atlanır.
"""

import importlib.util
from pathlib import Path

import pytest

from app.api import openapi_meta

# PyYAML, requirements.txt'teki uvicorn[standard] ile gelir; yoksa testler atlanır.
yaml = pytest.importorskip("yaml")

CONTRACT_PATH = Path(__file__).resolve().parents[2] / "api" / "openapi.yaml"


@pytest.fixture(scope="module")
def contract():
    if not CONTRACT_PATH.exists():
        pytest.skip(f"sözleşme dosyası bulunamadı: {CONTRACT_PATH}")
    return yaml.safe_load(CONTRACT_PATH.read_text(encoding="utf-8"))


def _request_example(contract, path):
    body = contract["paths"][path]["post"]["requestBody"]
    return body["content"]["application/json"]["example"]


def test_single_openapi_meta_module():
    # Kök dizindeki eski kopya (app/openapi_meta.py) kaldırıldı; tek kaynak app.api'dir.
    assert importlib.util.find_spec("app.openapi_meta") is None
    assert openapi_meta.__name__ == "app.api.openapi_meta"


def test_info_matches_contract(contract):
    assert openapi_meta.TITLE == contract["info"]["title"]
    assert openapi_meta.VERSION == contract["info"]["version"]
    assert openapi_meta.DESCRIPTION == contract["info"]["description"]


def test_servers_match_contract(contract):
    assert openapi_meta.SERVERS == contract["servers"]


def test_tags_match_contract(contract):
    assert openapi_meta.TAGS == contract["tags"]


def test_request_examples_match_contract(contract):
    register = openapi_meta.REGISTER_EXAMPLES["example"]["value"]
    create = openapi_meta.SUBSCRIPTION_CREATE_EXAMPLES["example"]["value"]
    assert register == _request_example(contract, "/auth/register")
    assert create == _request_example(contract, "/subscriptions")


def test_no_turkish_title_left():
    assert openapi_meta.TITLE == "Subscription Reminder API"


def test_generated_document_uses_contract_texts(contract):
    pytest.importorskip("fastapi")
    from app.main import app

    app.openapi_schema = None
    generated = app.openapi()
    assert generated["info"]["title"] == contract["info"]["title"]
    assert generated["info"]["version"] == contract["info"]["version"]
    assert generated["info"]["description"] == contract["info"]["description"]
    assert generated["servers"] == contract["servers"]
    assert generated["tags"] == contract["tags"]
