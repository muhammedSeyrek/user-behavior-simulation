from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SimulationSession, UserInteraction
from app.schemas import InteractionCreate, InteractionOut

router = APIRouter(prefix="/interactions", tags=["interactions"])

# Doğru karar mantığı:
# phishing içeriği → doğru karar: "reported_phishing" veya "ignored"
# meşru içerik     → doğru karar: "clicked_link"
_CORRECT_ACTIONS = {
    "phishing": {"reported_phishing", "ignored"},
    "legitimate": {"clicked_link"},
}


@router.post("/", response_model=InteractionOut, status_code=201)
def log_interaction(data: InteractionCreate, db: Session = Depends(get_db)):
    session = db.get(SimulationSession, data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı.")

    correct = data.action in _CORRECT_ACTIONS.get(session.content_type, set())

    interaction = UserInteraction(
        session_id=data.session_id,
        action=data.action,
        time_to_action_ms=data.time_to_action_ms,
        correct_decision=correct,
        extra_data=data.extra_data,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction
