from datetime import date, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.borrowing import BorrowTransaction, Fine
from app.models.catalog import Book
from app.models.enums import BorrowStatus, FineStatus, NotificationType
from app.models.member import Member
from app.models.misc import AuditLog, Notification
from app.services.fine_rules import calculate_fine_amount, calculate_overdue_days


def issue_book(db: Session, member_id: int, book_id: int, librarian_user_id: int,
                loan_period_days: Optional[int] = None) -> BorrowTransaction:
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")
    if member.status.value != "active":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Member is not active and cannot borrow books")

    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")
    if book.available_copies <= 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Book is currently unavailable")

    # Prevent the same member borrowing the same book twice while an active loan exists.
    duplicate = (
        db.query(BorrowTransaction)
        .filter(
            BorrowTransaction.member_id == member_id,
            BorrowTransaction.book_id == book_id,
            BorrowTransaction.status == BorrowStatus.ACTIVE,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This member already has an active loan for this book")

    # Enforce per-member borrowing limit.
    active_count = (
        db.query(BorrowTransaction)
        .filter(BorrowTransaction.member_id == member_id, BorrowTransaction.status == BorrowStatus.ACTIVE)
        .count()
    )
    if active_count >= settings.MAX_BOOKS_PER_MEMBER:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Member has reached the maximum of {settings.MAX_BOOKS_PER_MEMBER} borrowed books",
        )

    period = loan_period_days or settings.DEFAULT_LOAN_PERIOD_DAYS
    today = date.today()
    transaction = BorrowTransaction(
        member_id=member_id,
        book_id=book_id,
        issued_by_user_id=librarian_user_id,
        issue_date=today,
        due_date=today + timedelta(days=period),
        status=BorrowStatus.ACTIVE,
    )
    db.add(transaction)

    book.available_copies -= 1

    db.add(Notification(
        member_id=member_id,
        type=NotificationType.BOOK_ISSUED,
        title="Book issued",
        message=f'"{book.title}" has been issued to you. Due back {transaction.due_date.isoformat()}.',
    ))
    db.add(AuditLog(
        actor_user_id=librarian_user_id,
        action="issue_book",
        entity_type="borrow_transaction",
        details=f"book_id={book_id} member_id={member_id}",
    ))

    db.commit()
    db.refresh(transaction)
    return transaction


def return_book(db: Session, transaction_id: int, processed_by_user_id: int) -> BorrowTransaction:
    transaction = db.query(BorrowTransaction).filter(BorrowTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Borrow transaction not found")
    if transaction.status == BorrowStatus.RETURNED:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This book has already been returned")

    book = db.query(Book).filter(Book.id == transaction.book_id).first()

    today = date.today()
    transaction.return_date = today
    transaction.status = BorrowStatus.RETURNED
    transaction.returned_to_user_id = processed_by_user_id

    if book:
        book.available_copies = min(book.available_copies + 1, book.total_copies)

    overdue_days = calculate_overdue_days(transaction.due_date, today)
    fine_amount = calculate_fine_amount(overdue_days, settings.DAILY_FINE_AMOUNT)

    if fine_amount > 0:
        fine = Fine(
            transaction_id=transaction.id,
            member_id=transaction.member_id,
            amount=fine_amount,
            overdue_days=overdue_days,
            status=FineStatus.UNPAID,
        )
        db.add(fine)
        db.add(Notification(
            member_id=transaction.member_id,
            type=NotificationType.FINE_GENERATED,
            title="Fine generated",
            message=f"A fine of {fine_amount:.2f} was generated for a book returned {overdue_days} day(s) late.",
        ))

    db.add(Notification(
        member_id=transaction.member_id,
        type=NotificationType.BOOK_RETURNED,
        title="Book returned",
        message="Your book return has been processed.",
    ))
    db.add(AuditLog(
        actor_user_id=processed_by_user_id,
        action="return_book",
        entity_type="borrow_transaction",
        entity_id=transaction.id,
        details=f"overdue_days={overdue_days} fine={fine_amount}",
    ))

    db.commit()
    db.refresh(transaction)
    return transaction


def mark_overdue_transactions(db: Session) -> int:
    """Batch job: flip ACTIVE loans past their due date to OVERDUE. Returns count updated."""
    today = date.today()
    overdue = (
        db.query(BorrowTransaction)
        .filter(BorrowTransaction.status == BorrowStatus.ACTIVE, BorrowTransaction.due_date < today)
        .all()
    )
    for t in overdue:
        t.status = BorrowStatus.OVERDUE
        db.add(Notification(
            member_id=t.member_id,
            type=NotificationType.OVERDUE,
            title="Book overdue",
            message="A book you borrowed is now overdue. Please return it as soon as possible.",
        ))
    db.commit()
    return len(overdue)
