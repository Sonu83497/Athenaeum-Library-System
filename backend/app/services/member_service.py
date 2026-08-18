import math
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.borrowing import BorrowTransaction
from app.models.enums import BorrowStatus
from app.models.member import Member
from app.models.user import User
from app.schemas.library import MemberOut, MemberUpdate
from app.services.fine_service import get_member_outstanding_total


def to_member_out(db: Session, member: Member) -> MemberOut:
    active_count = (
        db.query(BorrowTransaction)
        .filter(
            BorrowTransaction.member_id == member.id,
            BorrowTransaction.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE]),
        )
        .count()
    )
    return MemberOut(
        id=member.id,
        membership_id=member.membership_id,
        status=member.status,
        join_date=member.join_date,
        full_name=member.user.full_name,
        email=member.user.email,
        phone=member.user.phone,
        outstanding_fine=get_member_outstanding_total(db, member.id),
        currently_borrowed_count=active_count,
    )


def search_members(db: Session, query: Optional[str], page: int = 1, page_size: int = 20):
    q = db.query(Member).join(User, Member.user_id == User.id)
    if query:
        like = f"%{query}%"
        q = q.filter(or_(User.full_name.ilike(like), User.email.ilike(like), Member.membership_id.ilike(like)))

    total = q.count()
    page = max(page, 1)
    page_size = max(min(page_size, 100), 1)
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = max(math.ceil(total / page_size), 1)
    return items, total, page, page_size, total_pages


def update_member(db: Session, member_id: int, payload: MemberUpdate) -> Member:
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")

    if payload.status is not None:
        member.status = payload.status
    if payload.phone is not None:
        member.user.phone = payload.phone

    db.commit()
    db.refresh(member)
    return member
