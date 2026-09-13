"""Tests for health and readiness probes."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Verify root status endpoint returns 200 and expected metadata."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "version" in data
    assert data["health_url"] == "/api/v1/health"


@pytest.mark.asyncio
async def test_health_liveness_probe(async_client: AsyncClient):
    """Verify liveness probe returns healthy status."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["llm_provider"] in ("ollama", "azure_openai")
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_readiness_probe(async_client: AsyncClient):
    """Verify readiness probe checks downstream components."""
    response = await async_client.get("/api/v1/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert "database_configured" in data
    assert "ai_gateway_mode" in data
    assert "checks" in data
    assert "embeddings" in data["checks"]


@pytest.mark.asyncio
async def test_security_headers_present(async_client: AsyncClient):
    """Verify security headers are attached to responses."""
    response = await async_client.get("/api/v1/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "X-Request-ID" in response.headers
    assert "X-Response-Time-MS" in response.headers
