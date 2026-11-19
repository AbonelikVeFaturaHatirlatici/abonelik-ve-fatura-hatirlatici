# Dosya: backend/app/main.py
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from functools import partial
from typing import Any

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from app.api.openapi_meta import DESCRIPTION, SERVERS, TAGS
from app.api.routes import auth, reminders, subscriptions
from app.infra.config import settings
from app.infra.errors import register_error_handlers
from app.infra.notifier import MockNotifier
from app.infra.scheduler import create_scheduler
from app.services.reminder_job import run_daily_reminder_job

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Günlük hatırlatma zamanlayıcısını API ile aynı süreçte başlatır ve durdurur."""
    scheduler = None
    if settings.SCHEDULER_ENABLED:
        daily_job = partial(run_daily_reminder_job, notifier=MockNotifier())
        scheduler = create_scheduler(daily_job)
        scheduler.start()
        logger.info(
            "Hatırlatma zamanlayıcısı başlatıldı (her gün 09:00 %s)", settings.TZ
        )
    try:
        yield
    finally:
        if scheduler is not None:
            # Çalışan iş varsa bitmesi beklenir; her hatırlatma zaten ayrı işlemde commit edilir.
            scheduler.shutdown(wait=True)
            logger.info("Hatırlatma zamanlayıcısı durduruldu")


app = FastAPI(
    title="Abonelik Hatırlatıcı API",
    version="0.1.0",
    description=DESCRIPTION,
    servers=SERVERS,
    openapi_tags=TAGS,
    lifespan=lifespan,
)

register_error_handlers(app)

app.include_router(auth.router)
app.include_router(subscriptions.router)
app.include_router(reminders.router)


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}


def _contract_openapi() -> dict[str, Any]:
    """FastAPI her uca otomatik 422 ekler; sözleşmede 422 yoktur (geçersiz girdi 400 döner).

    Üretilen /openapi.json bu yüzden 422 yanıtlarından ve bunların şemalarından arındırılır.
    Tek doğru kaynak yine api/openapi.yaml'dır.
    """
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        servers=app.servers,
        tags=app.openapi_tags,
    )
    for path_item in schema.get("paths", {}).values():
        for operation in path_item.values():
            if isinstance(operation, dict):
                operation.get("responses", {}).pop("422", None)
    component_schemas = schema.get("components", {}).get("schemas", {})
    for name in ("HTTPValidationError", "ValidationError"):
        component_schemas.pop(name, None)
    app.openapi_schema = schema
    return schema


app.openapi = _contract_openapi  # type: ignore[method-assign]
