# Dosya: backend/app/infra/scheduler.py
"""APScheduler kurulumu: günlük iş her gün 09:00 Europe/Istanbul.

- FastAPI ile aynı süreçte, lifespan tarafından başlatılır ve durdurulur (app/main.py).
  Çalıştırılacak iş dışarıdan verilir; bu modül servis katmanını içe aktarmaz.
- BackgroundScheduler kullanılır: iş senkron SQLAlchemy ile çalışır ve ayrı bir iş
  parçacığında koşar; olay döngüsünü (event loop) bloklamaz.
- Saat dilimi tetikleyiciye açıkça verilir; konteynerin sistem saat dilimine bağlı değildir.
- `max_instances=1` ve `coalesce=True`: iş üst üste binmez, kaçırılan tetiklemeler tek
  çalışmada birleşir. 09:00 en fazla `misfire_grace_time` kadar kaçırıldıysa iş yine
  çalışır; daha uzun kesintide günü gelmiş hatırlatmalar bir sonraki 09:00'da gönderilir.
"""
import logging
from collections.abc import Callable

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.infra.clock import APP_TZ

logger = logging.getLogger(__name__)

DAILY_REMINDER_JOB_ID = "daily_reminder_job"
DAILY_REMINDER_HOUR = 9
DAILY_REMINDER_MINUTE = 0
_MISFIRE_GRACE_SECONDS = 60 * 60


def _run_safely(job: Callable[[], object]) -> None:
    # Bir hata sonraki günün çalışmasını engellemez; ayrıntı günlüğe yazılır.
    try:
        job()
    except Exception:
        logger.exception("Günlük hatırlatma işi başarısız oldu")


def create_scheduler(daily_job: Callable[[], object]) -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone=APP_TZ)
    scheduler.add_job(
        _run_safely,
        trigger=CronTrigger(
            hour=DAILY_REMINDER_HOUR, minute=DAILY_REMINDER_MINUTE, timezone=APP_TZ
        ),
        args=[daily_job],
        id=DAILY_REMINDER_JOB_ID,
        name="Günlük hatırlatma üretimi ve gönderimi",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=_MISFIRE_GRACE_SECONDS,
    )
    return scheduler
