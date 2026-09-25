"""Application Configuration Module using Pydantic Settings."""

from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Core Application
    app_name: str = "FreeResume"
    app_env: Literal["local", "staging", "production", "test"] = "local"
    debug: bool = True
    log_level: str = "INFO"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # Security & Auth
    secret_key: str = "default-insecure-secret-change-in-production"
    jwt_secret_key: str = "default-insecure-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/resume_intelligence"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/resume_intelligence"
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Redis Cache & Queue
    redis_url: str = "redis://localhost:6379/0"

    # AI Gateway Settings (Dual-Mode: Local Ollama vs Deployed Azure OpenAI)
    llm_provider: Literal["ollama", "azure_openai"] = "ollama"

    # Ollama Local Settings
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"

    # Azure OpenAI Deployed Settings
    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""
    azure_openai_deployment_name: str = "gpt-4o-mini"
    azure_openai_api_version: str = "2024-08-01-preview"

    # AI Gateway Resilience
    ai_timeout_seconds: int = 30
    ai_max_retries: int = 2
    ai_circuit_breaker_failures: int = 3
    ai_circuit_breaker_reset_seconds: int = 60

    # Embeddings
    embedding_model: str = "all-MiniLM-L6-v2"
    vector_dimension: int = 384

    # File Uploads
    max_upload_size_bytes: int = 10 * 1024 * 1024  # 10 MB
    allowed_mime_types: str = (
        "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    allowed_extensions: str = ".pdf,.docx"
    upload_temp_dir: str = "./temp/uploads"

    # Rate Limits
    rate_limit_login_per_minute: int = 10
    rate_limit_ai_per_minute: int = 20
    rate_limit_global_per_minute: int = 120

    @field_validator("llm_provider")
    @classmethod
    def validate_llm_provider(cls, v: str) -> str:
        if v not in ("ollama", "azure_openai"):
            raise ValueError(f"Unsupported LLM_PROVIDER: {v}. Must be 'ollama' or 'azure_openai'")
        return v


settings = Settings()
