"""Configuración central de la aplicación vía pydantic-settings."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    """Variables de entorno de la plataforma."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # --- Aplicación ---
    APP_NAME: str = "CyberSec AI Platform"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # --- Base de datos ---
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/cybersec"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 300  # segundos

    # --- JWT ---
    JWT_SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- 2FA / OTP ---
    OTP_EXPIRE_MINUTES: int = 10
    OTP_LENGTH: int = 6

    # --- Cifrado (Fernet) ---
    FERNET_KEY: str = "change-me-generate-with-Fernet.generate_key()"

    # --- Email (SMTP) ---
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@cybersec.gt"
    SMTP_TLS: bool = True

    # --- CORS ---
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | List[str]) -> List[str]:
        """Permite ALLOWED_ORIGINS como string separado por comas o lista."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # --- Ollama (IA Soberana) ---
    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_DEFAULT_MODEL: str = "llama3"
    OLLAMA_TIMEOUT_SECONDS: int = 120

    # --- Celery ---
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # --- Amazon S3 (opcional) ---
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    AWS_REGION: str = "us-east-1"

    # --- Nmap ---
    NMAP_PATH: str = "/usr/bin/nmap"
    NVD_API_KEY: str = ""
    NVD_BASE_URL: str = "https://services.nvd.nist.gov/rest/json/cves/2.0"

    # --- Reportes ---
    REPORTS_DIR: str = "/app/reports"

    # --- Rate Limiting ---
    RATE_LIMIT_AUTH: str = "5/minute"
    RATE_LIMIT_API: str = "100/minute"

    # --- Superadmin inicial ---
    FIRST_SUPERADMIN_EMAIL: str = "admin@cybersec.gt"
    FIRST_SUPERADMIN_PASSWORD: str = "change-me-on-first-login"


settings = Settings()
