from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.api import participants, sessions, interactions, analytics

# Tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Phishing Awareness Simulation API",
    description="Kullanıcı davranışı simülasyonu ve phishing farkındalığı araştırma platformu",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(participants.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(interactions.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Phishing Awareness Simulation API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
