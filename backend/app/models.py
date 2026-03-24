import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Participant(Base):
    """Simülasyona katılan kullanıcı (anonim, rıza bazlı)."""

    __tablename__ = "participants"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Demografik bilgiler
    age_group: Mapped[str] = mapped_column(String(20))       # "18-24", "25-34", ...
    education: Mapped[str] = mapped_column(String(50))        # "lise", "lisans", "yüksek lisans"
    department: Mapped[str] = mapped_column(String(100))      # "BT", "Muhasebe", vb.
    it_experience: Mapped[str] = mapped_column(String(20))    # "yok", "az", "orta", "çok"
    prior_training: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)

    sessions: Mapped[list["SimulationSession"]] = relationship(back_populates="participant")


class SimulationSession(Base):
    """Tek bir simülasyon oturumu: kullanıcıya gösterilen bir içerik birimi."""

    __tablename__ = "simulation_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    participant_id: Mapped[str] = mapped_column(ForeignKey("participants.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    content_id: Mapped[str] = mapped_column(String(50))       # hangi içerik şablonu
    content_type: Mapped[str] = mapped_column(String(20))     # "phishing" | "legitimate"
    content_category: Mapped[str] = mapped_column(String(50)) # "bank", "it_support", vb.

    # Cihaz/tarayıcı bilgisi
    user_agent: Mapped[str | None] = mapped_column(Text)
    device_type: Mapped[str | None] = mapped_column(String(30))  # "mobile", "desktop"
    hour_of_day: Mapped[int | None] = mapped_column(Integer)

    interactions: Mapped[list["UserInteraction"]] = relationship(back_populates="session")
    participant: Mapped["Participant"] = relationship(back_populates="sessions")


class UserInteraction(Base):
    """Kullanıcının bir simülasyon oturumunda yaptığı eylem."""

    __tablename__ = "user_interactions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    session_id: Mapped[str] = mapped_column(ForeignKey("simulation_sessions.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    action: Mapped[str] = mapped_column(String(30))
    # "clicked_link" | "reported_phishing" | "ignored" | "submitted_form"

    time_to_action_ms: Mapped[int | None] = mapped_column(Integer)
    # İçerik gösteriminden bu eyleme kadar geçen süre (ms)

    correct_decision: Mapped[bool | None] = mapped_column(Boolean)
    # Doğru karar mı? (phishing'i bildirdi veya tıklamadı = True)

    extra_data: Mapped[str | None] = mapped_column(Text)  # JSON string

    session: Mapped["SimulationSession"] = relationship(back_populates="interactions")


class SurveyResponse(Base):
    """Simülasyon sonrası kullanıcı anketi (web alışkanlıkları + güvenlik farkındalığı)."""

    __tablename__ = "survey_responses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    participant_id: Mapped[str] = mapped_column(ForeignKey("participants.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    responses: Mapped[str] = mapped_column(Text)  # JSON — tüm soru/cevaplar
