"""Düzeltme 4: OpenAPI üst bilgileri api/openapi.yaml ile birebir aynı.

Sözleşme repo kökündeki `api/` klasöründedir; yalnızca `backend/` kopyalanmış bir
ortamda (ör. Docker imajı) bu testler atlanır.
"""

from pathlib import Path

import pytest

from app import openapi_meta

# PyYAML, requirements.txt'teki uvicorn[standard] ile gelir; yoksa testler atlanır.
yaml = pytest.importorskip("yaml")

CONTRACT_PATH = Path(__file__).resolve().parents[2] / "api" / "openapi.yaml"


@pytest.fixture(scope="module")
def contract():
    if not CONTRACT_PATH.exists():
        pytest.skip(f"sözleşme dosyası bulunamadı: {CONTRACT_PATH}")
    return yaml.safe_load(CONTRACT_PATH.read_text(encoding="utf-8"))


def test_info_matches_contract(contract):
    assert openapi_meta.TITLE == contract["info"]["title"]
    assert openapi_meta.VERSION == contract["info"]["version"]
    assert openapi_meta.DESCRIPTION == contract["info"]["description"]


def test_servers_match_contract(contract):
    assert openapi_meta.SERVERS == contract["servers"]


def test_tags_match_contract(contract):
    assert openapi_meta.TAGS == contract["tags"]


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
