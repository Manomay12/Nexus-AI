import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Google Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Supabase & PostgreSQL
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Embedding Options
    # "production" attempts to use Google Gemini text-embedding-004
    # "mock" uses deterministic 768-dim mock vectors for offline/hackathon reliability
    EMBEDDING_MODE: str = "production"
    EMBEDDING_DIMENSION: int = 768

    # Demo Mode: if True or if external APIs are unconfigured, run with zero external crash risk
    DEMO_MODE: bool = False

    # Optional Google Earth Engine Backend Integration
    EARTH_ENGINE_ENABLED: bool = False
    EARTH_ENGINE_PROJECT: str = ""
    EARTH_ENGINE_SERVICE_ACCOUNT: str = ""
    EARTH_ENGINE_PRIVATE_KEY: str = ""


    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY and len(self.GEMINI_API_KEY) > 5)

    @property
    def has_supabase(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_SERVICE_ROLE_KEY)

settings = Settings()
