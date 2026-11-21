# Dosya: backend/app/api/routes/reminders.py
from fastapi import APIRouter

from app import schemas
from app.api.deps import CurrentUser, DbSession
from app.api.responses import UNAUTHORIZED
from app.services import reminders as reminder_service

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get(
    "",
    operation_id="listReminders",
    summary="Kullanıcının üretilmiş hatırlatmalarını düz liste olarak getirir",
    response_model=list[schemas.Reminder],
    response_description="Hatırlatma listesi (en yeni önce)",
    responses={401: UNAUTHORIZED},
)
def list_reminders(user: CurrentUser, db: DbSession) -> list[schemas.Reminder]:
    return [
        schemas.Reminder.model_validate(r)
        for r in reminder_service.list_reminders(db, user.id)
    ]
