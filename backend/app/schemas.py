from datetime import datetime

from pydantic import BaseModel


# ── Participant ──────────────────────────────────────────────────────────────

class ParticipantCreate(BaseModel):
    age_group: str
    education: str
    department: str
    it_experience: str
    prior_training: bool
    consent_given: bool


class ParticipantOut(BaseModel):
    id: str
    created_at: datetime
    age_group: str
    education: str
    department: str
    it_experience: str
    prior_training: bool

    class Config:
        from_attributes = True


# ── SimulationSession ────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    participant_id: str
    user_agent: str | None = None
    device_type: str | None = None


class SessionBatchCreate(BaseModel):
    participant_id: str
    count: int = 5
    user_agent: str | None = None


class SessionOut(BaseModel):
    id: str
    content_id: str
    content_type: str
    content_category: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── UserInteraction ──────────────────────────────────────────────────────────

class InteractionCreate(BaseModel):
    session_id: str
    action: str
    time_to_action_ms: int | None = None
    confidence_score: int | None = None      # 1-5 Likert
    decision_motivation: list[str] | None = None  # seçilen sebepler
    extra_data: str | None = None


class InteractionOut(BaseModel):
    id: str
    session_id: str
    action: str
    time_to_action_ms: int | None
    correct_decision: bool | None
    timestamp: datetime

    class Config:
        from_attributes = True


# ── Auth ─────────────────────────────────────────────────────────────────────

class AuthVerifyRequest(BaseModel):
    username: str
    password: str


# ── Survey ───────────────────────────────────────────────────────────────────

class SurveyCreate(BaseModel):
    participant_id: str
    responses: dict  # soru → cevap map'i


class SurveyOut(BaseModel):
    id: str
    participant_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard / Analytics ────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_participants: int
    total_sessions: int
    total_interactions: int
    phishing_click_rate: float       # % phishing sessions where user clicked
    correct_decision_rate: float     # % interactions where decision was correct
    avg_time_to_action_ms: float | None

    by_department: list[dict]
    by_age_group: list[dict]
    by_it_experience: list[dict]
    recent_interactions: list[dict]
