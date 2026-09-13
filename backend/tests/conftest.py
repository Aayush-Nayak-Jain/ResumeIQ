"""Pytest Test Configuration and Fixtures."""

import os
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient

# Set environment to test before importing app
os.environ["APP_ENV"] = "test"
os.environ["SECRET_KEY"] = "test-secret-key-32-chars-minimum-length!!"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-32-chars-minimum!!"

from app.main import app


@pytest.fixture
async def async_client() -> AsyncIterator[AsyncClient]:
    """Provides an async HTTP client for FastAPI endpoint testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
