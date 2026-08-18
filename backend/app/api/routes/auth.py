from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserOut,
    UserRegister,
)
from app.services.auth_service import (
    authenticate_user,
    issue_token_for_user,
    register_user,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)


@router.post(
    "/register",
    response_model=UserOut,
    status_code=201,
)
def register(
    payload: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new account.

    Roles:
    - member
    - librarian
    - admin
    """

    user = register_user(db, payload)

    return _to_user_out(user)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Login for all user roles.
    """

    user = authenticate_user(db, payload)

    token = issue_token_for_user(user)

    return TokenResponse(
        access_token=token,
        role=user.role,
    )


@router.get(
    "/me",
    response_model=UserOut,
)
def me(
    current_user: User = Depends(get_current_user),
):
    """
    Return currently authenticated user.
    """

    return _to_user_out(current_user)


def _to_user_out(user: User) -> UserOut:
    """
    Convert SQLAlchemy User model to UserOut schema.
    """

    membership_id = (
        user.member.membership_id
        if user.member
        else None
    )

    return UserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        membership_id=membership_id,
    )