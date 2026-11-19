from fastapi import FastAPI

from app.infra.errors import register_error_handlers
from app.openapi_meta import DESCRIPTION, SERVERS, TAGS, TITLE, VERSION

app = FastAPI(
    title=TITLE,
    version=VERSION,
    description=DESCRIPTION,
    servers=SERVERS,
    openapi_tags=TAGS,
)

register_error_handlers(app)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
