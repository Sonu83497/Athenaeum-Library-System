"""
Centralized application configuration.

Values are read from environment variables and .env.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ============================================================
    # APP
    # ============================================================

    APP_NAME: str = "Library Management System API"
    ENV: str = "development"
    DEBUG: bool = True

    # ============================================================
    # DATABASE
    # ============================================================

    DATABASE_URL: str = "sqlite:///./library.db"

    # ============================================================
    # AUTH
    # ============================================================

    JWT_SECRET: str = "CHANGE_ME_IN_PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8

    # ============================================================
    # CORS
    # ============================================================

    CORS_ORIGINS: str = "http://localhost:5173"

    # ============================================================
    # AI - GROQ
    # ============================================================

    # Supported providers:
    # groq
    # gemini
    # anthropic
    # openai
    # none

    AI_PROVIDER: str = "groq"

    # Keep the API key in .env / Render Environment Variables.
    # NEVER put the actual API key in GitHub.
    AI_API_KEY: str = ""

    # Groq model used by the current provider implementation.
    AI_MODEL: str = "openai/gpt-oss-120b"

    AI_MAX_TOKENS: int = 1024
    AI_MAX_INPUT_CHARS: int = 2000

    # ============================================================
    # BUSINESS RULES
    # ============================================================

    DAILY_FINE_AMOUNT: float = 5.0
    DEFAULT_LOAN_PERIOD_DAYS: int = 14
    MAX_BOOKS_PER_MEMBER: int = 5

    # ============================================================
    # PYDANTIC SETTINGS
    # ============================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
