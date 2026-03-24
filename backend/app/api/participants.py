from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Participant
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


@router.get("/{participant_id}", response_model=ParticipantOut)
def get_participant(participant_id: str, db: Session = Depends(get_db)):
    p = db.get(Participant, participant_id)
    if not p:
        raise HTTPException(status_code=404, detail="Katılımcı bulunamadı.")
    return p
