from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import MemberStatus


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    membership_id: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    status: Mapped[MemberStatus] = mapped_column(Enum(MemberStatus), default=MemberStatus.ACTIVE)
    join_date: Mapped[date] = mapped_column(Date, default=date.today)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="member")
    borrow_transactions = relationship("BorrowTransaction", back_populates="member")
    fines = relationship("Fine", back_populates="member")
    feedback = relationship("Feedback", back_populates="member")
    notifications = relationship("Notification", back_populates="member")
