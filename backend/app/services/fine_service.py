from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.borrowing import Fine
from app.models.enums import FineStatus


def mark_fine_paid(db: Session, fine_id: int) -> Fine:
    fine = db.query(Fine).filter(Fine.id == fine_id).first()
    if not fine:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fine not found")
    if fine.status == FineStatus.PAID:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Fine is already marked as paid")

    fine.status = FineStatus.PAID
    fine.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(fine)
    return fine


def get_member_outstanding_total(db: Session, member_id: int) -> float:
    fines = (
        db.query(Fine)
        .filter(Fine.member_id == member_id, Fine.status == FineStatus.UNPAID)
        .all()
    )
    return round(sum(f.amount for f in fines), 2)
