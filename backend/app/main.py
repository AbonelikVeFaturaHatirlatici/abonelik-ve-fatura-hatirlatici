from fastapi import FastAPI

from app.infra.errors import register_error_handlers

app = FastAPI(
    title="Abonelik Hatırlatıcı API",
    version="0.1.0",
)

register_error_handlers(app)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
