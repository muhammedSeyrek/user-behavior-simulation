from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://phish_user:phish_pass@localhost:5432/phish_db"
    secret_key: str = "supersecretkey123"
    cors_origins: str = "http://localhost:5173"

    # Araştırmacı dashboard kimlik bilgileri
    researcher_username: str = "researcher"
    researcher_password: str = "phishsim2024"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
