from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_member, require_staff
from app.models.member import Member
from app.models.misc import Feedback
from app.models.user import User
from app.schemas.library import FeedbackCreate, FeedbackOut
from app.services import feedback_service

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackOut, status_code=201)
def submit_feedback(payload: FeedbackCreate, db: Session = Depends(get_db),
                     member: Member = Depends(get_current_member)):
    return feedback_service.create_feedback(db, member.id, payload.rating, payload.category, payload.message)


@router.get("", response_model=list[FeedbackOut])
def list_feedback(db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


@router.put("/{feedback_id}/review", response_model=FeedbackOut)
def review_feedback(feedback_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return feedback_service.mark_feedback_reviewed(db, feedback_id)


@router.delete("/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    feedback_service.delete_feedback(db, feedback_id)
