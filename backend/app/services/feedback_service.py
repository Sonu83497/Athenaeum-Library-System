from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.misc import Feedback, Notification


def create_feedback(db: Session, member_id: int, rating: int, category: str, message: str) -> Feedback:
    fb = Feedback(member_id=member_id, rating=rating, category=category, message=message)
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb


def mark_feedback_reviewed(db: Session, feedback_id: int) -> Feedback:
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Feedback not found")
    fb.is_reviewed = True
    db.commit()
    db.refresh(fb)
    return fb


def delete_feedback(db: Session, feedback_id: int) -> None:
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Feedback not found")
    db.delete(fb)
    db.commit()


def list_notifications(db: Session, member_id: int, unread_only: bool = False):
    q = db.query(Notification).filter(Notification.member_id == member_id)
    if unread_only:
        q = q.filter(Notification.is_read.is_(False))
    return q.order_by(Notification.created_at.desc()).all()


def mark_notification_read(db: Session, notification_id: int, member_id: int) -> Notification:
    n = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.member_id == member_id)
        .first()
    )
    if not n:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    n.is_read = True
    db.commit()
    db.refresh(n)
    return n
