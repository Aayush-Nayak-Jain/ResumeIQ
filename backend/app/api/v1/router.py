"""Main API v1 Router Registration."""

from fastapi import APIRouter

from app.api.v1.health import router as health_router

api_v1_router = APIRouter(prefix="/api/v1")

# Register feature sub-routers
api_v1_router.include_router(health_router)
