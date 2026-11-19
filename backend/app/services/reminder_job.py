# Dosya: backend/app/services/reminder_job.py
"""Günlük hatırlatma işi (her gün 09:00 Europe/Istanbul; zamanlama: infra/scheduler.py).

İki aşama, her biri tekrar çalıştırılabilir (idempotent):

1. Üretim: her AKTİF aboneliğin bugünden sonraki ilk yenilemesi için 3 ve 1 gün önceki
   hatırlatmalar üretilir. Geçmişe düşen gün üretilmez (domain.reminders.due_reminders).
   Var olan kayıt `uq_reminder_subscription_renewal_days` sayesinde ON CONFLICT DO NOTHING
   ile atlanır; iş iki kez çalışsa da çift kayıt oluşmaz. İptal edilen aboneliğe yeni
   hatırlatma üretilmez.

2. Gönderim: günü gelmiş (remind_on <= bugün), yenilemesi henüz geçmemiş
   (renewal_date > bugün) ve `created` durumundaki hatırlatmalar NotificationPort ile
   gönderilir ve `sent_mock` olarak işaretlenir. Önceki günlerde kaçırılanlar (ör. sunucu
   09:00'da kapalıydı) bir sonraki çalışmada gönderilir. İptal edilmiş aboneliğin daha önce
   üretilmiş hatırlatmaları listede kalır ama gönderilmez.

Her hatırlatma ayrı bir işlemde `FOR UPDATE SKIP LOCKED` ile kilitlenir; birden fazla süreç
aynı anda çalışsa bile bir hatırlatma iki kez gönderilmez. Gönderim başarısız olursa kayıt
`created` kalır ve sonraki çalışmada yeniden denenir.
"""

import logging
import uuid
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from datetime import date

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.domain.notifications import NotificationPort, ReminderNotification
from app.domain.reminders import due_reminders
from app.domain.renewal import Period
from app.infra.clock import today_local
from app.infra.db import SessionLocal
from app.infra.models import (
    REMINDER_STATUS_CREATED,
    REMINDER_STATUS_SENT_MOCK,
    SUBSCRIPTION_STATUS_ACTIVE,
    Reminder,
    Subscription,
)

logger = logging.getLogger(__name__)

_INSERT_BATCH_SIZE = 500


@dataclass(frozen=True)
class ReminderJobResult:
    run_date: date
    generated: int
    sent: int
    failed: int


def _planned_rows(db: Session, today: date) -> Iterator[dict]:
    stmt = (
        select(
            Subscription.id,
            Subscription.start_date,
            Subscription.period,
            Subscription.created_at,
        )
        .where(Subscription.status == SUBSCRIPTION_STATUS_ACTIVE)
        .execution_options(yield_per=_INSERT_BATCH_SIZE)
    )
    for subscription_id, start_date, period, created_at in db.execute(stmt):
        created_on = created_at.date() if hasattr(created_at, "date") else created_at
        for planned in due_reminders(
            start_date=start_date,
            period=Period(period),
            created_on=created_on,
            today=today,
        ):
            yield {
                "id": uuid.uuid4(),
                "subscription_id": subscription_id,
                "renewal_date": planned.renewal_date,
                "days_before": planned.days_before,
                "remind_on": planned.remind_on,
                "status": REMINDER_STATUS_CREATED,
            }


def generate_reminders(db: Session, today: date) -> int:
    """Eksik hatırlatmaları üretir ve işler (commit). Yeni eklenen kayıt sayısını döndürür."""
    rows = list(_planned_rows(db, today))
    inserted = 0
    for start in range(0, len(rows), _INSERT_BATCH_SIZE):
        batch = rows[start : start + _INSERT_BATCH_SIZE]
        stmt = (
            pg_insert(Reminder)
            .values(batch)
            .on_conflict_do_nothing(constraint="uq_reminder_subscription_renewal_days")
            .returning(Reminder.id)
        )
        inserted += len(db.scalars(stmt).all())
    db.commit()
    return inserted


def _due_reminder_ids(db: Session, today: date) -> list[uuid.UUID]:
    stmt = (
        select(Reminder.id)
        .join(Reminder.subscription)
        .where(
            Reminder.status == REMINDER_STATUS_CREATED,
            Reminder.remind_on <= today,
            Reminder.renewal_date > today,
            Subscription.status == SUBSCRIPTION_STATUS_ACTIVE,
        )
        .order_by(Reminder.remind_on, Reminder.id)
    )
    ids = list(db.scalars(stmt))
    db.commit()  # okuma işlemini kapat; her hatırlatma kendi işleminde kilitlenir
    return ids


def _lock_due_reminder(
    db: Session, reminder_id: uuid.UUID
) -> tuple[Reminder, Subscription] | None:
    stmt = (
        select(Reminder, Subscription)
        .join(Reminder.subscription)
        .where(
            Reminder.id == reminder_id,
            Reminder.status == REMINDER_STATUS_CREATED,
            Subscription.status == SUBSCRIPTION_STATUS_ACTIVE,
        )
        .with_for_update(of=Reminder, skip_locked=True)
    )
    row = db.execute(stmt).first()
    return None if row is None else (row[0], row[1])


def dispatch_due_reminders(
    db: Session, notifier: NotificationPort, today: date
) -> tuple[int, int]:
    """Günü gelmiş hatırlatmaları gönderir. (gönderilen, başarısız) sayılarını döndürür."""
    sent = 0
    failed = 0
    for reminder_id in _due_reminder_ids(db, today):
        locked = _lock_due_reminder(db, reminder_id)
        if locked is None:
            # Başka bir süreç kilitledi/gönderdi ya da abonelik bu arada iptal edildi.
            db.rollback()
            continue
        reminder, subscription = locked
        notification = ReminderNotification(
            reminder_id=reminder.id,
            user_id=subscription.user_id,
            subscription_id=subscription.id,
            service_name=subscription.service_name,
            amount_kurus=subscription.amount_kurus,
            renewal_date=reminder.renewal_date,
            days_before=reminder.days_before,
        )
        try:
            notifier.send_reminder(notification)
        except Exception:
            db.rollback()
            failed += 1
            logger.exception("Hatırlatma gönderilemedi: reminder=%s", reminder_id)
            continue
        reminder.status = REMINDER_STATUS_SENT_MOCK
        db.commit()
        sent += 1
    return sent, failed


def run_daily_reminder_job(
    notifier: NotificationPort,
    session_factory: Callable[[], Session] = SessionLocal,
    today: date | None = None,
) -> ReminderJobResult:
    """Zamanlayıcının çağırdığı giriş noktası. Kendi veritabanı oturumunu açar ve kapatır."""
    run_date = today if today is not None else today_local()
    with session_factory() as db:
        generated = generate_reminders(db, run_date)
        sent, failed = dispatch_due_reminders(db, notifier, run_date)
    result = ReminderJobResult(
        run_date=run_date, generated=generated, sent=sent, failed=failed
    )
    logger.info(
        "Günlük hatırlatma işi tamamlandı: tarih=%s uretilen=%d gonderilen=%d basarisiz=%d",
        result.run_date.isoformat(),
        result.generated,
        result.sent,
        result.failed,
    )
    return result
