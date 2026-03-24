import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.config import settings

security = HTTPBasic()


def require_researcher(credentials: HTTPBasicCredentials = Depends(security)):
    """Araştırmacı endpoint'leri için HTTP Basic Auth."""
    username_ok = secrets.compare_digest(
        credentials.username.encode(), settings.researcher_username.encode()
    )
    password_ok = secrets.compare_digest(
        credentials.password.encode(), settings.researcher_password.encode()
    )
    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kimlik bilgileri.",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username
