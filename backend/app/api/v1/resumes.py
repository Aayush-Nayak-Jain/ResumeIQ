"""Resume Management API Endpoints (Module 3)."""

import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.resume import (
    ResumeCreateRequest,
    ResumeListResponse,
    ResumeResponse,
    ResumeUpdateRequest,
)
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resumes", tags=["Resume Management"])


@router.get(
    "",
    response_model=list[ResumeListResponse],
    status_code=status.HTTP_200_OK,
    summary="List all resumes for authenticated user",
)
async def list_resumes(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> list[ResumeListResponse]:
    """Retrieves all master and tailored resumes owned by the current candidate."""
    return await ResumeService.list_resumes(db=db, user_id=current_user.id)


@router.post(
    "",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new resume document",
)
async def create_resume(
    req: ResumeCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """Creates a new resume document and initializes revision version 1."""
    resume = await ResumeService.create_resume(db=db, user_id=current_user.id, req=req)
    return ResumeService.to_response_dto(resume)


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get resume document details",
)
async def get_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """Fetches full structured resume details with zero-trust IDOR ownership verification."""
    resume = await ResumeService.get_resume_by_id(
        db=db, resume_id=resume_id, user_id=current_user.id
    )
    return ResumeService.to_response_dto(resume)


@router.put(
    "/{resume_id}",
    response_model=ResumeResponse,
    status_code=status.HTTP_200_OK,
    summary="Update resume structured content",
)
async def update_resume(
    resume_id: uuid.UUID,
    req: ResumeUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """Updates resume sections and automatically increments revision version number."""
    updated = await ResumeService.update_resume(
        db=db, resume_id=resume_id, user_id=current_user.id, req=req
    )
    return ResumeService.to_response_dto(updated)


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a resume document",
)
async def delete_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Permanently deletes a resume and its revision versions with ownership check."""
    await ResumeService.delete_resume(db=db, resume_id=resume_id, user_id=current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
