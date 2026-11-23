# Dosya: backend/app/infra/clock.py
"""Saat kaynağı. Zaman damgaları UTC; takvim günleri `TZ` (Europe/Istanbul) ile."""

from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo

from app.infra.config import settings

APP_TZ = ZoneInfo(settings.TZ)


def now_utc() -> datetime:
    return datetime.now(UTC)


def today_local() -> date:
    """Europe/Istanbul takvimine göre bugün."""
    return datetime.now(APP_TZ).date()
