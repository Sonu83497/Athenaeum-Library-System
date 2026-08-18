from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_member
from app.models.member import Member
from app.schemas.library import NotificationOut
from app.services import feedback_service as notif_service  # notifications live alongside feedback service

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(unread_only: bool = False, db: Session = Depends(get_db),
                        member: Member = Depends(get_current_member)):
    return notif_service.list_notifications(db, member.id, unread_only)


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db), member: Member = Depends(get_current_member)):
    return notif_service.mark_notification_read(db, notification_id, member.id)
