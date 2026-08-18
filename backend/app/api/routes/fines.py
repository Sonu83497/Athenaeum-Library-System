from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_member, require_staff
from app.models.borrowing import Fine
from app.models.member import Member
from app.models.user import User
from app.schemas.library import FineOut
from app.services.fine_service import mark_fine_paid

router = APIRouter(prefix="/api/fines", tags=["fines"])


@router.get("", response_model=list[FineOut])
def list_fines(db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return db.query(Fine).order_by(Fine.created_at.desc()).limit(200).all()


@router.get("/my", response_model=list[FineOut])
def my_fines(db: Session = Depends(get_db), member: Member = Depends(get_current_member)):
    return db.query(Fine).filter(Fine.member_id == member.id).all()


@router.put("/{fine_id}/pay", response_model=FineOut)
def pay_fine(fine_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return mark_fine_paid(db, fine_id)
