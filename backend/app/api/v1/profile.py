"""Candidate Profile API Endpoints (Module 2)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import (
    CandidateProfileResponse,
    CandidateProfileUpdateRequest,
)
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Candidate Profile"])


@router.get(
    "/me",
    response_model=CandidateProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current candidate master profile facts",
)
async def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> CandidateProfileResponse:
    """Retrieves the verified master facts for the authenticated candidate."""
    profile = await ProfileService.get_or_create_profile(db=db, user_id=current_user.id)
    return ProfileService.to_response_dto(profile)


@router.put(
    "/me",
    response_model=CandidateProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update candidate master profile facts",
)
async def update_my_profile(
    req: CandidateProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> CandidateProfileResponse:
    """Updates candidate skills, work experience, education, projects, and contact info."""
    updated = await ProfileService.update_profile(db=db, user_id=current_user.id, req=req)
    return ProfileService.to_response_dto(updated)
