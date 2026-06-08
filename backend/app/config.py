"""Application configuration from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://localhost:5432/little_heartbeat"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    UPLOAD_DIR: str = "./uploads"
    CORS_ORIGINS: str = "http://localhost:5173"
    TESSERACT_CMD: str = "tesseract"

    @property
    def CORS_ORIGINS_LIST(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
