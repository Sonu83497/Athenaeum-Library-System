from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.assistant import AssistantError, ask_assistant
from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_member, get_current_user
from app.models.member import Member
from app.models.user import User

router = APIRouter(prefix="/api/chat", tags=["ai-assistant"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=settings.AI_MAX_INPUT_CHARS)


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    member: Member = Depends(get_current_member),
):
    try:
        reply = ask_assistant(db, user_id=user.id, member_id=member.id, user_message=payload.message)
    except AssistantError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))
    return ChatResponse(reply=reply)
