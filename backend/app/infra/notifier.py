# Dosya: backend/app/infra/notifier.py
"""NotificationPort'un Sprint 1 uygulaması: gerçek bildirim göndermez, günlüğe yazar.

Gönderilen hatırlatma veritabanında `sent_mock` olarak işaretlenir (sözleşme:
"sent_mock = mock bildirim gönderildi"). Günlüğe kişisel veri (e-posta) yazılmaz.
"""

import logging

from app.domain.notifications import ReminderNotification

logger = logging.getLogger(__name__)


class MockNotifier:
    def send_reminder(self, notification: ReminderNotification) -> None:
        logger.info(
            "Mock bildirim: reminder=%s user=%s subscription=%s servis=%r "
            "tutar_kurus=%d yenileme=%s gun_once=%d",
            notification.reminder_id,
            notification.user_id,
            notification.subscription_id,
            notification.service_name,
            notification.amount_kurus,
            notification.renewal_date.isoformat(),
            notification.days_before,
        )
