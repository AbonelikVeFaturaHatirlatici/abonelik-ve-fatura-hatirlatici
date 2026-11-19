# Dosya: backend/app/domain/notifications.py
"""Bildirim portu. Saf tanım: veritabanı, web ve gönderim teknolojisinden bağımsız.

Sprint 1'de gerçek push bildirimi kapsam dışıdır; port'u `infra.notifier.MockNotifier`
uygular. Gerçek bir sağlayıcı ileride yalnızca bu port'u uygulayarak eklenir.
"""

import uuid
from dataclasses import dataclass
from datetime import date
from typing import Protocol


@dataclass(frozen=True)
class ReminderNotification:
    reminder_id: uuid.UUID
    user_id: uuid.UUID
    subscription_id: uuid.UUID
    service_name: str
    amount_kurus: int
    renewal_date: date
    days_before: int


class NotificationError(Exception):
    """Bildirim gönderilemedi; hatırlatma `created` durumunda kalır, sonraki çalışmada denenir."""


class NotificationPort(Protocol):
    def send_reminder(self, notification: ReminderNotification) -> None:
        """Bildirimi gönderir. Başarısızlıkta NotificationError (veya başka bir hata) yükseltir."""
        ...
