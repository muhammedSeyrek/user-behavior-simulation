import io
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import Integer, cast, func, select
from sqlalchemy.orm import Session

from app.api.auth import require_researcher
from app.config import settings
from app.database import get_db
from app.models import PasswordAnalysis, Participant, SimulationSession, UserInteraction
from app.schemas import AuthVerifyRequest, DashboardStats

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/verify")
def verify_auth(body: AuthVerifyRequest):
    """Araştırmacı kimlik bilgilerini doğrula (JSON body ile)."""
    username_ok = secrets.compare_digest(body.username.encode(), settings.researcher_username.encode())
    password_ok = secrets.compare_digest(body.password.encode(), settings.researcher_password.encode())
    if not (username_ok and password_ok):
        raise HTTPException(status_code=401, detail="Hatalı kimlik bilgileri.")
    return {"status": "ok"}


@router.get("/dashboard", response_model=DashboardStats, dependencies=[Depends(require_researcher)])
def get_dashboard(db: Session = Depends(get_db)):
    total_participants = db.scalar(select(func.count()).select_from(Participant))
    total_sessions = db.scalar(select(func.count()).select_from(SimulationSession))
    total_interactions = db.scalar(select(func.count()).select_from(UserInteraction))

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

    correct_count = db.scalar(
        select(func.count())
        .select_from(UserInteraction)
        .where(UserInteraction.correct_decision == True)
    ) or 0

    correct_decision_rate = (correct_count / total_interactions * 100) if total_interactions else 0.0

    avg_time = db.scalar(
        select(func.avg(UserInteraction.time_to_action_ms)).select_from(UserInteraction)
    )

    by_dept = db.execute(
        select(Participant.department, func.count(SimulationSession.id).label("sessions"))
        .join(SimulationSession, Participant.id == SimulationSession.participant_id)
        .group_by(Participant.department)
    ).all()

    by_age = db.execute(
        select(Participant.age_group, func.count(SimulationSession.id).label("sessions"))
        .join(SimulationSession, Participant.id == SimulationSession.participant_id)
        .group_by(Participant.age_group)
    ).all()

    by_it = db.execute(
        select(
            Participant.it_experience,
            func.count(UserInteraction.id).label("total"),
        )
        .join(SimulationSession, Participant.id == SimulationSession.participant_id)
        .join(UserInteraction, SimulationSession.id == UserInteraction.session_id)
        .group_by(Participant.it_experience)
    ).all()

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

    pwd_row = db.execute(
        select(
            func.count(PasswordAnalysis.id).label("total"),
            func.avg(PasswordAnalysis.length).label("avg_length"),
            func.avg(PasswordAnalysis.score).label("avg_score"),
            func.avg(cast(PasswordAnalysis.has_upper, Integer)).label("pct_upper"),
            func.avg(cast(PasswordAnalysis.has_lower, Integer)).label("pct_lower"),
            func.avg(cast(PasswordAnalysis.has_digit, Integer)).label("pct_digit"),
            func.avg(cast(PasswordAnalysis.has_special, Integer)).label("pct_special"),
        ).select_from(PasswordAnalysis)
    ).one()

    pwd_total = pwd_row.total or 0

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
        password_tests=pwd_total,
        avg_password_length=round(pwd_row.avg_length or 0, 1),
        avg_password_score=round(pwd_row.avg_score or 0, 1),
        pct_has_upper=round((pwd_row.pct_upper or 0) * 100, 1),
        pct_has_lower=round((pwd_row.pct_lower or 0) * 100, 1),
        pct_has_digit=round((pwd_row.pct_digit or 0) * 100, 1),
        pct_has_special=round((pwd_row.pct_special or 0) * 100, 1),
    )


def _build_export_df(db: Session):
    """Tüm etkileşim verisini tek DataFrame'e topla."""
    import pandas as pd  # lazy import — modül yüklenirken hata vermez
    rows = db.execute(
        select(
            Participant.id.label("katilimci_id"),
            Participant.age_group.label("yas_grubu"),
            Participant.education.label("egitim"),
            Participant.department.label("bolum"),
            Participant.it_experience.label("bt_deneyimi"),
            Participant.prior_training.label("onceki_egitim"),
            Participant.created_at.label("kayit_zamani"),
            SimulationSession.id.label("oturum_id"),
            SimulationSession.content_id.label("icerik_id"),
            SimulationSession.content_type.label("icerik_turu"),
            SimulationSession.content_category.label("icerik_kategorisi"),
            SimulationSession.device_type.label("cihaz_turu"),
            SimulationSession.hour_of_day.label("gun_saati"),
            UserInteraction.action.label("eylem"),
            UserInteraction.time_to_action_ms.label("karar_suresi_ms"),
            UserInteraction.correct_decision.label("dogru_karar"),
            UserInteraction.timestamp.label("eylem_zamani"),
        )
        .join(SimulationSession, Participant.id == SimulationSession.participant_id)
        .join(UserInteraction, SimulationSession.id == UserInteraction.session_id)
        .order_by(UserInteraction.timestamp.desc())
    ).all()

    return pd.DataFrame(rows, columns=[
        "katilimci_id", "yas_grubu", "egitim", "bolum", "bt_deneyimi",
        "onceki_egitim", "kayit_zamani", "oturum_id", "icerik_id",
        "icerik_turu", "icerik_kategorisi", "cihaz_turu", "gun_saati",
        "eylem", "karar_suresi_ms", "dogru_karar", "eylem_zamani",
    ])


@router.get("/export/csv", dependencies=[Depends(require_researcher)])
def export_csv(db: Session = Depends(get_db)):
    """Araştırmacı: tüm veriyi CSV olarak indir."""
    df = _build_export_df(db)
    buf = io.StringIO()
    df.to_csv(buf, index=False, encoding="utf-8-sig")  # utf-8-sig → Excel'de Türkçe
    buf.seek(0)
    filename = f"phishsim_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/export/excel", dependencies=[Depends(require_researcher)])
def export_excel(db: Session = Depends(get_db)):
    """Araştırmacı: tüm veriyi Excel olarak indir."""
    df = _build_export_df(db)
    buf = io.BytesIO()
    import pandas as pd
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Etkileşimler")

        # Özet sayfa
        summary = pd.DataFrame({
            "Metrik": [
                "Toplam Katılımcı",
                "Toplam Oturum",
                "Toplam Etkileşim",
                "Phishing Tıklama Oranı (%)",
                "Doğru Karar Oranı (%)",
            ],
            "Değer": [
                df["katilimci_id"].nunique(),
                df["oturum_id"].nunique(),
                len(df),
                round(
                    len(df[(df["icerik_turu"] == "phishing") & (df["eylem"] == "clicked_link")])
                    / max(len(df[df["icerik_turu"] == "phishing"]), 1) * 100, 1
                ),
                round(df["dogru_karar"].mean() * 100, 1) if len(df) else 0,
            ],
        })
        summary.to_excel(writer, index=False, sheet_name="Özet")

    buf.seek(0)
    filename = f"phishsim_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
