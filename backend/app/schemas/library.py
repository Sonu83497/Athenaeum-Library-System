from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import (
    BorrowStatus,
    FineStatus,
    MemberStatus,
    NotificationType,
)
from app.schemas.catalog import BookOut


class MemberOut(BaseModel):
    id: int
    membership_id: str
    status: MemberStatus
    join_date: date
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    outstanding_fine: float = 0.0
    currently_borrowed_count: int = 0

    model_config = {"from_attributes": True}


class MemberUpdate(BaseModel):
    status: Optional[MemberStatus] = None
    phone: Optional[str] = None


class BorrowCreate(BaseModel):
    member_id: int
    book_id: int
    loan_period_days: Optional[int] = Field(
        default=None,
        ge=1,
        le=90,
    )


class BorrowOut(BaseModel):
    id: int
    member_id: int
    book: BookOut
    issue_date: date
    due_date: date
    return_date: Optional[date] = None
    status: BorrowStatus

    model_config = {"from_attributes": True}


class ReturnRequest(BaseModel):
    transaction_id: int


class FineOut(BaseModel):
    id: int
    transaction_id: int
    member_id: int
    amount: float
    overdue_days: int
    status: FineStatus
    paid_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FeedbackCreate(BaseModel):
    rating: int = Field(
        ge=1,
        le=5,
    )
    category: str = "general"
    message: str = Field(
        min_length=1,
        max_length=2000,
    )


class FeedbackOut(BaseModel):
    id: int
    member_id: int
    rating: int
    category: str
    message: str
    is_reviewed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_books: int
    available_books: int
    issued_books: int
    total_members: int
    active_members: int
    overdue_books: int
    outstanding_fines_total: float


class MemberDashboardStats(BaseModel):
    total_books: int
    available_books: int
    currently_borrowed: int
    overdue_books: int
    outstanding_fine: float