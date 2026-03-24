from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PasswordAnalysis
from app.schemas import PasswordAnalysisCreate

router = APIRouter(prefix="/password-analysis", tags=["password-analysis"])


@router.post("/", status_code=201)
def log_password_analysis(data: PasswordAnalysisCreate, db: Session = Depends(get_db)):
    """Anonim şifre istatistiğini kaydet — gerçek şifre alınmaz."""
    record = PasswordAnalysis(**data.model_dump())
    db.add(record)
    db.commit()
    return {"status": "ok"}
