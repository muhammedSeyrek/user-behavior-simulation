import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Participant, SurveyResponse
from app.schemas import SurveyCreate, SurveyOut

router = APIRouter(prefix="/survey", tags=["survey"])


@router.post("/", response_model=SurveyOut, status_code=201)
def submit_survey(data: SurveyCreate, db: Session = Depends(get_db)):
    """Katılımcı anket cevaplarını kaydet."""
    participant = db.get(Participant, data.participant_id)
    if not participant:
        raise HTTPException(status_code=404, detail="Katılımcı bulunamadı.")

    survey = SurveyResponse(
        participant_id=data.participant_id,
        responses=json.dumps(data.responses, ensure_ascii=False),
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return survey
