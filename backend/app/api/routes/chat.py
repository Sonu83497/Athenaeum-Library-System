from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.assistant import AssistantError, ask_assistant
from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.member import Member
from app.models.user import User


router = APIRouter(
    prefix="/api/chat",
    tags=["ai-assistant"],
)


# ============================================================
# REQUEST / RESPONSE SCHEMAS
# ============================================================

class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=settings.AI_MAX_INPUT_CHARS,
    )


class ChatResponse(BaseModel):
    reply: str


# ============================================================
# AI CHAT ENDPOINT
# ============================================================

@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    AI Library Assistant.

    Important:
    - Every authenticated user can use the AI assistant.
    - Member profile is OPTIONAL.
    - Members get access to their own personal data
      such as borrowed books, due dates and fines.
    - Admins/Librarians can still ask general library questions
      even when they do not have a Member profile.
    """

    # --------------------------------------------------------
    # Find member profile if one exists.
    #
    # Do NOT use get_current_member here because that dependency
    # raises 404 when an Admin/Librarian has no member profile.
    # --------------------------------------------------------

    member: Optional[Member] = (
        db.query(Member)
        .filter(Member.user_id == user.id)
        .first()
    )

    member_id = member.id if member else None

    # --------------------------------------------------------
    # Ask AI assistant
    # --------------------------------------------------------

    try:
        reply = ask_assistant(
            db=db,
            user_id=user.id,
            member_id=member_id,
            user_message=payload.message,
        )

    except AssistantError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        # Keep unexpected backend errors from becoming an
        # unhandled 500 without a useful response.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The AI assistant could not process your request.",
        ) from exc

    return ChatResponse(reply=reply)
