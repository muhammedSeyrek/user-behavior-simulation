from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.content import get_random_content, get_all_content
from app.database import get_db
from app.models import Participant, SimulationSession
from app.schemas import SessionCreate, SessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _detect_device(user_agent: str | None) -> str:
    if not user_agent:
        return "unknown"
    ua = user_agent.lower()
    if any(x in ua for x in ["mobile", "android", "iphone"]):
        return "mobile"
    return "desktop"


@router.post("/", response_model=SessionOut, status_code=201)
def create_session(data: SessionCreate, db: Session = Depends(get_db)):
    participant = db.get(Participant, data.participant_id)
    if not participant:
        raise HTTPException(status_code=404, detail="Katılımcı bulunamadı.")

    content = get_random_content()

    session = SimulationSession(
        participant_id=data.participant_id,
        content_id=content["id"],
        content_type=content["type"],
        content_category=content["category"],
        user_agent=data.user_agent,
        device_type=_detect_device(data.user_agent),
        hour_of_day=datetime.utcnow().hour,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}/content")
def get_session_content(session_id: str, db: Session = Depends(get_db)):
    """Oturumun içeriğini döndür (simülasyon sayfası için)."""
    session = db.get(SimulationSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı.")

    all_content = get_all_content()
    content = next((c for c in all_content if c["id"] == session.content_id), None)
    if not content:
        raise HTTPException(status_code=404, detail="İçerik bulunamadı.")

    return {
        "session_id": session_id,
        "content": content,
    }
