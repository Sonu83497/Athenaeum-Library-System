from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import BorrowStatus, FineStatus


class BorrowTransaction(Base):
    __tablename__ = "borrow_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), nullable=False, index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), nullable=False, index=True)
    book_copy_id: Mapped[int] = mapped_column(ForeignKey("book_copies.id"), nullable=True)
    issued_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    returned_to_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    issue_date: Mapped[date] = mapped_column(Date, default=date.today)
    due_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    return_date: Mapped[date] = mapped_column(Date, nullable=True)

    status: Mapped[BorrowStatus] = mapped_column(
        Enum(BorrowStatus), default=BorrowStatus.ACTIVE, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    member = relationship("Member", back_populates="borrow_transactions")
    book = relationship("Book", back_populates="borrow_transactions")
    fine = relationship("Fine", back_populates="transaction", uselist=False, cascade="all, delete-orphan")


class Fine(Base):
    __tablename__ = "fines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    transaction_id: Mapped[int] = mapped_column(
        ForeignKey("borrow_transactions.id"), unique=True, nullable=False
    )
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    overdue_days: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[FineStatus] = mapped_column(Enum(FineStatus), default=FineStatus.UNPAID, index=True)
    paid_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transaction = relationship("BorrowTransaction", back_populates="fine")
    member = relationship("Member", back_populates="fines")
