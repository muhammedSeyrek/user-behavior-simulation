from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Participant, SimulationSession, UserInteraction
from app.schemas import DashboardStats

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_participants = db.scalar(select(func.count()).select_from(Participant))
    total_sessions = db.scalar(select(func.count()).select_from(SimulationSession))
    total_interactions = db.scalar(select(func.count()).select_from(UserInteraction))

    # Phishing tıklama oranı
    phishing_sessions = db.scalar(
        select(func.count())
        .select_from(SimulationSession)
        .where(SimulationSession.content_type == "phishing")
    ) or 0

    phishing_clicks = db.scalar(
        select(func.count())
        .select_from(UserInteraction)
        .join(SimulationSession)
        .where(
            SimulationSession.content_type == "phishing",
            UserInteraction.action == "clicked_link",
        )
    ) or 0

    phishing_click_rate = (phishing_clicks / phishing_sessions * 100) if phishing_sessions else 0.0

    # Doğru karar oranı
    correct_count = db.scalar(
        select(func.count())
        .select_from(UserInteraction)
        .where(UserInteraction.correct_decision == True)
    ) or 0

    correct_decision_rate = (correct_count / total_interactions * 100) if total_interactions else 0.0

    # Ortalama karar süresi
    avg_time = db.scalar(
        select(func.avg(UserInteraction.time_to_action_ms)).select_from(UserInteraction)
    )

    # Departmana göre dağılım
    by_dept = db.execute(
        select(Participant.department, func.count(SimulationSession.id).label("sessions"))
        .join(SimulationSession, Participant.id == SimulationSession.participant_id)
        .group_by(Participant.department)
    ).all()

    # Yaş grubuna göre dağılım
    by_age = db.execute(
        select(Participant.age_group, func.count(SimulationSession.id).label("sessions"))
        .join(SimulationSession, Participant.id == SimulationSession.participant_id)
        .group_by(Participant.age_group)
    ).all()

    # BT deneyimine göre dağılım
    by_it = db.execute(
        select(
            Participant.it_experience,
            func.count(UserInteraction.id).label("total"),
            func.sum(
                func.cast(UserInteraction.correct_decision, type_=func.Integer if False else None)
            ).label("correct"),
        )
        .join(SimulationSession, Participant.id == SimulationSession.participant_id)
        .join(UserInteraction, SimulationSession.id == UserInteraction.session_id)
        .group_by(Participant.it_experience)
    ).all()

    # Son etkileşimler
    recent = db.execute(
        select(
            UserInteraction.action,
            UserInteraction.correct_decision,
            UserInteraction.time_to_action_ms,
            SimulationSession.content_type,
            SimulationSession.content_category,
        )
        .join(SimulationSession)
        .order_by(UserInteraction.timestamp.desc())
        .limit(20)
    ).all()

    return DashboardStats(
        total_participants=total_participants or 0,
        total_sessions=total_sessions or 0,
        total_interactions=total_interactions or 0,
        phishing_click_rate=round(phishing_click_rate, 1),
        correct_decision_rate=round(correct_decision_rate, 1),
        avg_time_to_action_ms=round(avg_time, 0) if avg_time else None,
        by_department=[{"department": r.department, "sessions": r.sessions} for r in by_dept],
        by_age_group=[{"age_group": r.age_group, "sessions": r.sessions} for r in by_age],
        by_it_experience=[{"it_experience": r.it_experience, "total": r.total} for r in by_it],
        recent_interactions=[
            {
                "action": r.action,
                "correct": r.correct_decision,
                "time_ms": r.time_to_action_ms,
                "content_type": r.content_type,
                "category": r.content_category,
            }
            for r in recent
        ],
    )
