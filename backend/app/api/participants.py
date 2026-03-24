from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import require_researcher
from app.database import get_db
from app.models import Participant, SimulationSession, UserInteraction
from app.schemas import ParticipantCreate, ParticipantOut

router = APIRouter(prefix="/participants", tags=["participants"])


@router.post("/", response_model=ParticipantOut, status_code=201)
def create_participant(data: ParticipantCreate, db: Session = Depends(get_db)):
    if not data.consent_given:
        raise HTTPException(status_code=400, detail="Rıza verilmeden kayıt yapılamaz.")
    participant = Participant(**data.model_dump())
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


@router.get("/", dependencies=[Depends(require_researcher)])
def list_participants(
    db: Session = Depends(get_db),
    age_group: str | None = Query(None),
    education: str | None = Query(None),
    department: str | None = Query(None),
    it_experience: str | None = Query(None),
    prior_training: bool | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
):
    """Araştırmacı: katılımcıları filtreli listele."""
    q = select(Participant)
    if age_group:
        q = q.where(Participant.age_group == age_group)
    if education:
        q = q.where(Participant.education == education)
    if department:
        q = q.where(Participant.department.ilike(f"%{department}%"))
    if it_experience:
        q = q.where(Participant.it_experience == it_experience)
    if prior_training is not None:
        q = q.where(Participant.prior_training == prior_training)

    total = len(db.execute(q).all())
    rows = db.execute(q.offset(offset).limit(limit)).scalars().all()

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": [
            {
                "id": p.id,
                "created_at": p.created_at,
                "age_group": p.age_group,
                "education": p.education,
                "department": p.department,
                "it_experience": p.it_experience,
                "prior_training": p.prior_training,
                "session_count": len(p.sessions),
            }
            for p in rows
        ],
    }


@router.get("/{participant_id}", response_model=ParticipantOut)
def get_participant(participant_id: str, db: Session = Depends(get_db)):
    p = db.get(Participant, participant_id)
    if not p:
        raise HTTPException(status_code=404, detail="Katılımcı bulunamadı.")
    return p
