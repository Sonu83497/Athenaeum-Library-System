from datetime import date, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.borrowing import BorrowTransaction, Fine
from app.models.catalog import (
    Book,
    book_authors,
    book_categories,
    Author,
    Category,
)
from app.models.enums import (
    BorrowStatus,
    FineStatus,
    MemberStatus,
)
from app.models.member import Member
from app.schemas.library import (
    DashboardStats,
    MemberDashboardStats,
)


def get_dashboard_stats(db: Session) -> DashboardStats:
    total_books = (
        db.query(
            func.coalesce(
                func.sum(Book.total_copies),
                0,
            )
        ).scalar()
        or 0
    )

    available_books = (
        db.query(
            func.coalesce(
                func.sum(Book.available_copies),
                0,
            )
        ).scalar()
        or 0
    )

    issued_books = total_books - available_books

    total_members = (
        db.query(func.count(Member.id)).scalar()
        or 0
    )

    active_members = (
        db.query(func.count(Member.id))
        .filter(
            Member.status == MemberStatus.ACTIVE
        )
        .scalar()
        or 0
    )

    overdue_books = (
        db.query(func.count(BorrowTransaction.id))
        .filter(
            BorrowTransaction.status.in_(
                [BorrowStatus.OVERDUE]
            )
        )
        .scalar()
        or 0
    )

    overdue_books += (
        db.query(func.count(BorrowTransaction.id))
        .filter(
            BorrowTransaction.status
            == BorrowStatus.ACTIVE,
            BorrowTransaction.due_date < date.today(),
        )
        .scalar()
        or 0
    )

    outstanding_fines_total = (
        db.query(
            func.coalesce(
                func.sum(Fine.amount),
                0.0,
            )
        )
        .filter(
            Fine.status == FineStatus.UNPAID
        )
        .scalar()
        or 0.0
    )

    return DashboardStats(
        total_books=int(total_books),
        available_books=int(available_books),
        issued_books=int(issued_books),
        total_members=int(total_members),
        active_members=int(active_members),
        overdue_books=int(overdue_books),
        outstanding_fines_total=round(
            float(outstanding_fines_total),
            2,
        ),
    )


def get_member_dashboard_stats(
    db: Session,
    user_id: int,
) -> MemberDashboardStats:

    member = (
        db.query(Member)
        .filter(Member.user_id == user_id)
        .first()
    )

    if not member:
        raise ValueError(
            "No member profile is associated with this account"
        )

    total_books = (
        db.query(
            func.coalesce(
                func.sum(Book.total_copies),
                0,
            )
        ).scalar()
        or 0
    )

    available_books = (
        db.query(
            func.coalesce(
                func.sum(Book.available_copies),
                0,
            )
        ).scalar()
        or 0
    )

    currently_borrowed = (
        db.query(func.count(BorrowTransaction.id))
        .filter(
            BorrowTransaction.member_id == member.id,
            BorrowTransaction.status
            == BorrowStatus.ACTIVE,
        )
        .scalar()
        or 0
    )

    overdue_books = (
        db.query(func.count(BorrowTransaction.id))
        .filter(
            BorrowTransaction.member_id == member.id,
            BorrowTransaction.status.in_(
                [
                    BorrowStatus.ACTIVE,
                    BorrowStatus.OVERDUE,
                ]
            ),
            BorrowTransaction.due_date < date.today(),
        )
        .scalar()
        or 0
    )

    outstanding_fine = (
        db.query(
            func.coalesce(
                func.sum(Fine.amount),
                0.0,
            )
        )
        .filter(
            Fine.member_id == member.id,
            Fine.status == FineStatus.UNPAID,
        )
        .scalar()
        or 0.0
    )

    return MemberDashboardStats(
        total_books=int(total_books),
        available_books=int(available_books),
        currently_borrowed=int(currently_borrowed),
        overdue_books=int(overdue_books),
        outstanding_fine=round(
            float(outstanding_fine),
            2,
        ),
    )


def monthly_borrowing_trend(
    db: Session,
    months: int = 6,
) -> list[dict]:

    since = (
        date.today().replace(day=1)
        - timedelta(days=31 * months)
    )

    rows = (
        db.query(
            (
                func.strftime(
                    "%Y-%m",
                    BorrowTransaction.issue_date,
                ).label("month")
                if db.bind.dialect.name == "sqlite"
                else func.date_format(
                    BorrowTransaction.issue_date,
                    "%Y-%m",
                ).label("month")
            ),
            func.count(
                BorrowTransaction.id
            ).label("count"),
        )
        .filter(
            BorrowTransaction.issue_date >= since
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    return [
        {
            "month": r.month,
            "count": r.count,
        }
        for r in rows
    ]


def monthly_returns_trend(
    db: Session,
    months: int = 6,
) -> list[dict]:

    since = (
        date.today().replace(day=1)
        - timedelta(days=31 * months)
    )

    rows = (
        db.query(
            (
                func.strftime(
                    "%Y-%m",
                    BorrowTransaction.return_date,
                ).label("month")
                if db.bind.dialect.name == "sqlite"
                else func.date_format(
                    BorrowTransaction.return_date,
                    "%Y-%m",
                ).label("month")
            ),
            func.count(
                BorrowTransaction.id
            ).label("count"),
        )
        .filter(
            BorrowTransaction.return_date.isnot(None),
            BorrowTransaction.return_date >= since,
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    return [
        {
            "month": r.month,
            "count": r.count,
        }
        for r in rows
    ]


def popular_books(
    db: Session,
    limit: int = 10,
) -> list[dict]:

    rows = (
        db.query(
            Book.title,
            func.count(
                BorrowTransaction.id
            ).label("borrow_count"),
        )
        .join(
            BorrowTransaction,
            BorrowTransaction.book_id == Book.id,
        )
        .group_by(Book.id)
        .order_by(
            func.count(
                BorrowTransaction.id
            ).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "title": r.title,
            "borrow_count": r.borrow_count,
        }
        for r in rows
    ]


def popular_categories(
    db: Session,
    limit: int = 10,
) -> list[dict]:

    rows = (
        db.query(
            Category.name,
            func.count(
                BorrowTransaction.id
            ).label("borrow_count"),
        )
        .join(
            book_categories,
            book_categories.c.category_id
            == Category.id,
        )
        .join(
            BorrowTransaction,
            BorrowTransaction.book_id
            == book_categories.c.book_id,
        )
        .group_by(Category.id)
        .order_by(
            func.count(
                BorrowTransaction.id
            ).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "category": r.name,
            "borrow_count": r.borrow_count,
        }
        for r in rows
    ]


def overdue_report(
    db: Session,
    member_id: Optional[int] = None,
) -> list[BorrowTransaction]:

    q = db.query(BorrowTransaction).filter(
        BorrowTransaction.status.in_(
            [
                BorrowStatus.OVERDUE,
                BorrowStatus.ACTIVE,
            ]
        ),
        BorrowTransaction.due_date < date.today(),
    )

    if member_id:
        q = q.filter(
            BorrowTransaction.member_id == member_id
        )

    return q.all()