"""System Health and Readiness Verification Endpoints."""

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health & Status"])


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    llm_provider: str
    llm_model: str
    timestamp: str


class ReadinessResponse(BaseModel):
    status: str
    database_configured: bool
    redis_configured: bool
    ai_gateway_mode: str
    checks: dict[str, Any]
    timestamp: str


@router.get("", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def get_health() -> HealthResponse:
    """Liveness probe: verifies the API service is active and responsive."""
    active_model = settings.ollama_model if settings.llm_provider == "ollama" else settings.azure_openai_deployment_name
    return HealthResponse(
        status="healthy",
        app_name=settings.app_name,
        version="0.1.0",
        environment=settings.app_env,
        llm_provider=settings.llm_provider,
        llm_model=active_model,
        timestamp=datetime.now(UTC).isoformat(),
    )


@router.get("/ready", response_model=ReadinessResponse, status_code=status.HTTP_200_OK)
async def get_readiness() -> ReadinessResponse:
    """Readiness probe: validates environment configuration and downstream readiness."""
    db_ok = bool(settings.database_url)
    redis_ok = bool(settings.redis_url)

    ai_configured = False
    if settings.llm_provider == "ollama":
        ai_configured = bool(settings.ollama_base_url)
    elif settings.llm_provider == "azure_openai":
        ai_configured = bool(settings.azure_openai_endpoint and settings.azure_openai_api_key)

    checks = {
        "database": "configured" if db_ok else "missing_url",
        "redis": "configured" if redis_ok else "missing_url",
        "ai_gateway": {
            "provider": settings.llm_provider,
            "configured": ai_configured,
            "timeout_seconds": settings.ai_timeout_seconds,
            "circuit_breaker_threshold": settings.ai_circuit_breaker_failures,
        },
        "embeddings": {
            "model": settings.embedding_model,
            "dimension": settings.vector_dimension,
        },
    }

    return ReadinessResponse(
        status="ready" if (db_ok and redis_ok) else "degraded",
        database_configured=db_ok,
        redis_configured=redis_ok,
        ai_gateway_mode=settings.llm_provider,
        checks=checks,
        timestamp=datetime.now(UTC).isoformat(),
    )
