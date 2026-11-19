# Dosya: backend/app/services/reminders.py
"""Üretilmiş hatırlatmaları salt okunur listeleme (senkron oturum)."""
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infra.models import Reminder, Subscription


def list_reminders(db: Session, user_id: uuid.UUID) -> list[Reminder]:
    """Kullanıcının tüm hatırlatmaları, en yeni önce (iptal edilen aboneliklerinkiler dahil)."""
    stmt = (
        select(Reminder)
        .join(Reminder.subscription)
        .where(Subscription.user_id == user_id)
        .order_by(Reminder.created_at.desc(), Reminder.remind_on.desc(), Reminder.id)
    )
    return list(db.scalars(stmt))
