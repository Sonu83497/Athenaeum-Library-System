import os
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_member, require_staff
from app.models.borrowing import BorrowTransaction
from app.models.enums import BorrowStatus
from app.models.member import Member
from app.models.user import User
from app.schemas.library import BorrowCreate, BorrowOut, ReturnRequest
from app.services import borrow_service


router = APIRouter(prefix="/api/borrow", tags=["borrowing"])


@router.post("", response_model=BorrowOut, status_code=201)
def issue(
    payload: BorrowCreate,
    db: Session = Depends(get_db),
    staff: User = Depends(require_staff),
):
    """
    Issue a book to a library member.
    """
    txn = borrow_service.issue_book(
        db,
        payload.member_id,
        payload.book_id,
        staff.id,
        payload.loan_period_days,
    )
    return txn


@router.post("/{transaction_id}/return", response_model=BorrowOut)
def do_return(
    transaction_id: int,
    db: Session = Depends(get_db),
    staff: User = Depends(require_staff),
):
    """
    Return a borrowed book.

    The borrow service automatically:
    - calculates overdue days
    - calculates fine
    - creates an unpaid Fine if required
    - restores book availability
    - creates notifications
    """
    return borrow_service.return_book(
        db,
        transaction_id,
        staff.id,
    )


@router.get("", response_model=list[BorrowOut])
def list_all(
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    """
    List all borrowing transactions for staff.
    """
    return (
        db.query(BorrowTransaction)
        .order_by(BorrowTransaction.created_at.desc())
        .limit(200)
        .all()
    )


@router.get("/my", response_model=list[BorrowOut])
def my_borrowed(
    db: Session = Depends(get_db),
    member: Member = Depends(get_current_member),
):
    """
    List borrowing transactions belonging to the logged-in member.
    """
    return (
        db.query(BorrowTransaction)
        .filter(BorrowTransaction.member_id == member.id)
        .order_by(BorrowTransaction.created_at.desc())
        .all()
    )


@router.post(
    "/{transaction_id}/simulate-overdue",
    response_model=BorrowOut,
)
def simulate_overdue(
    transaction_id: int,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    """
    DEVELOPMENT/TESTING ONLY.

    Moves the transaction due date into the past so that the normal
    return flow can generate an overdue fine.

    This does NOT create a Fine directly.

    The normal return_book() service remains responsible for:
    - calculating overdue days
    - calculating fine amount
    - creating the Fine record
    """
    environment = os.getenv("ENVIRONMENT", "development").lower()

    if environment == "production":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testing endpoint is disabled in production",
        )

    transaction = (
        db.query(BorrowTransaction)
        .filter(BorrowTransaction.id == transaction_id)
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrow transaction not found",
        )

    if transaction.status == BorrowStatus.RETURNED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot simulate overdue for a returned transaction",
        )

    # Make the due date one day in the past.
    transaction.due_date = date.today() - timedelta(days=1)

    # Keep the loan active.
    # return_book() will calculate the overdue fine normally.
    transaction.status = BorrowStatus.ACTIVE

    db.commit()
    db.refresh(transaction)

    return transaction