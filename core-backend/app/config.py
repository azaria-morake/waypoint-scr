"""
Waypoint Secure - Environment & System Configuration
"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://waypoint:waypoint_secure_password_2026@localhost:5432/waypoint_secure"
    )
    FALLBACK_SQLITE_URL: str = "sqlite+aiosqlite:///./waypoint_secure.db"

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Cryptography (AES-256-GCM & Argon2id)
    KMS_MASTER_KEY_HEX: str = os.getenv(
        "KMS_MASTER_KEY_HEX",
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    )
    KMS_KEY_ID: str = "arn:aws:kms:af-south-1:982736412398:key/waypoint-bolo-popia-safe"
    HMAC_DEVICE_SECRET: str = os.getenv("HMAC_DEVICE_SECRET", "waypoint_device_secret_2026")

    # JWT
    JWT_SECRET: str = "waypoint_super_secret_jwt_key_2026_fnb_hackathon"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # LLM keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
