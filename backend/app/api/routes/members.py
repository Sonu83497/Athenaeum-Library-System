from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_member, require_staff
from app.models.member import Member
from app.models.user import User
from app.schemas.library import MemberOut, MemberUpdate
from app.services import member_service

router = APIRouter(prefix="/api/members", tags=["members"])


@router.get("", response_model=list[MemberOut])
def list_members(q: Optional[str] = None, page: int = 1, page_size: int = 20,
                  db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    items, *_ = member_service.search_members(db, q, page, page_size)
    return [member_service.to_member_out(db, m) for m in items]


@router.get("/me", response_model=MemberOut)
def my_profile(db: Session = Depends(get_db), member: Member = Depends(get_current_member)):
    return member_service.to_member_out(db, member)


@router.get("/{member_id}", response_model=MemberOut)
def get_member(member_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        from fastapi import HTTPException, status
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")
    return member_service.to_member_out(db, member)


@router.put("/{member_id}", response_model=MemberOut)
def update_member(member_id: int, payload: MemberUpdate, db: Session = Depends(get_db),
                   _staff: User = Depends(require_staff)):
    member = member_service.update_member(db, member_id, payload)
    return member_service.to_member_out(db, member)
