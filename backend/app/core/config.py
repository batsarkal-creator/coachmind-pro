"""Application Configuration"""
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "CoachMind Pro"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./coachmind.db"

    # Security
    SECRET_KEY: str = "coachmind-super-secret-key-2026-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI Coach
    AI_MODEL_PATH: str = "./models/coach_ai.pkl"
    MAX_WORKOUT_DURATION: int = 120  # minutes

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
