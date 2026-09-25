"""Pytest Test Configuration and Async Database Fixtures."""

import os
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Set environment variables for testing before importing app modules
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-32-chars-minimum-length!!"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-32-chars-minimum!!"

from app.models.base import Base

from app.db.session import get_db
from app.main import app

# In-memory async test engine
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    future=True,
)

test_async_session_maker = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(autouse=True)
async def setup_database() -> AsyncIterator[None]:
    """Creates all database tables before each test and drops them afterwards."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    """Provides a transactional database session for tests."""
    async with test_async_session_maker() as session:
        yield session


@pytest.fixture
async def async_client() -> AsyncIterator[AsyncClient]:
    """Provides an async HTTP client with database dependency override."""

    async def override_get_db() -> AsyncIterator[AsyncSession]:
        async with test_async_session_maker() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
