import random
import string

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.enums import UserRole
from app.models.member import Member
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister


def _generate_membership_id(db: Session) -> str:
    """
    Generate a unique library membership ID.

    Example:
    LIB400064
    """

    while True:
        candidate = "LIB" + "".join(
            random.choices(string.digits, k=6)
        )

        exists = (
            db.query(Member)
            .filter(Member.membership_id == candidate)
            .first()
        )

        if not exists:
            return candidate


def register_user(db: Session, payload: UserRegister) -> User:
    """
    Register a new user.

    Supported roles:
    - member
    - librarian
    - admin

    Only members receive a Member profile and membership ID.
    """

    # Check duplicate email
    existing = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create user
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )

    db.add(user)
    db.flush()

    # Only MEMBER gets membership profile
    if payload.role == UserRole.MEMBER:
        member = Member(
            user_id=user.id,
            membership_id=_generate_membership_id(db),
        )

        db.add(member)

    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    payload: UserLogin,
) -> User:
    """
    Authenticate admin, librarian or member.
    """

    user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not verify_password(
        payload.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    return user


def issue_token_for_user(user: User) -> str:
    """
    Create JWT token containing user ID and role.
    """

    return create_access_token(
        subject=str(user.id),
        role=user.role.value,
    )