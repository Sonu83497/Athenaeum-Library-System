from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_any, require_staff
from app.models.user import User
from app.schemas.library import DashboardStats, MemberDashboardStats
from app.services import report_service


router = APIRouter(
    prefix="/api/reports",
    tags=["reports"],
)


@router.get(
    "/dashboard",
    response_model=DashboardStats,
)
def dashboard(
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return report_service.get_dashboard_stats(db)


@router.get(
    "/member-dashboard",
    response_model=MemberDashboardStats,
)
def member_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_any),
):
    return report_service.get_member_dashboard_stats(
        db,
        user.id,
    )


@router.get("/borrowing")
def borrowing_trend(
    months: int = 6,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return {
        "monthly_borrowing": report_service.monthly_borrowing_trend(
            db,
            months,
        ),
        "monthly_returns": report_service.monthly_returns_trend(
            db,
            months,
        ),
    }


@router.get("/overdue")
def overdue(
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    rows = report_service.overdue_report(db)

    return [
        {
            "transaction_id": t.id,
            "member_id": t.member_id,
            "book_title": t.book.title,
            "due_date": t.due_date.isoformat(),
        }
        for t in rows
    ]


@router.get("/popular-books")
def popular_books(
    limit: int = 10,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return report_service.popular_books(
        db,
        limit,
    )


@router.get("/popular-categories")
def popular_categories(
    limit: int = 10,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    return report_service.popular_categories(
        db,
        limit,
    )