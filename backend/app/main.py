"""Main FastAPI Application Entry Point."""

import os
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.logging import logger, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan manager for startup and shutdown routines."""
    # Setup structured logging with PII scrubbing filter
    setup_logging(log_level=settings.log_level)
    logger.info("Starting %s in %s mode", settings.app_name, settings.app_env)
    logger.info("Active AI Gateway Provider: %s", settings.llm_provider)

    # Ensure upload temporary directories exist securely
    os.makedirs(settings.upload_temp_dir, exist_ok=True)

    # Auto-initialize database tables for local execution
    try:
        from app.models.base import Base
        from app.db.session import engine
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified/created successfully.")
    except Exception as exc:
        logger.warning("Could not auto-create database tables on startup: %s", str(exc))

    yield

    logger.info("Shutting down %s", settings.app_name)



app = FastAPI(
    title=settings.app_name,
    description=(
        "Intelligent ATS scoring, semantic job matching, "
        "and multi-version resume optimization platform."
    ),
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan,
)


# -----------------------------------------------------------------------------
# Security Headers Middleware
# -----------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.app_env == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response  # type: ignore[no-any-return]


# -----------------------------------------------------------------------------
# Request Timing & Correlation ID Middleware
# -----------------------------------------------------------------------------
class RequestCorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        start_time = time.perf_counter()

        response: Response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-MS"] = f"{duration_ms:.2f}"

        logger.info(
            "%s %s -> %s (%.2f ms) [req_id=%s]",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )
        return response  # type: ignore[no-any-return]


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestCorrelationMiddleware)

# -----------------------------------------------------------------------------
# CORS Middleware
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time-MS"],
)

# -----------------------------------------------------------------------------
# Include Routers
# -----------------------------------------------------------------------------
app.include_router(api_v1_router)


@app.get("/", tags=["Root"])
async def root() -> JSONResponse:
    """Root status summary pointing to health and documentation."""
    return JSONResponse(
        content={
            "app": settings.app_name,
            "version": "0.1.0",
            "environment": settings.app_env,
            "status": "operational",
            "docs_url": "/docs" if settings.debug else None,
            "health_url": "/api/v1/health",
        }
    )
