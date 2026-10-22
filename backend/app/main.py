from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from app.infra.db import Base, engine
from app.infra.errors import register_error_handlers


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    # Tabloların veritabanında var olduğundan emin ol (PostgreSQL)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Veritabani baglanti uyarisi: {e}")
    yield


app = FastAPI(
    title="Abonelik Hatırlatıcı API",
    version="0.1.0",
    lifespan=lifespan,
)

register_error_handlers(app)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
