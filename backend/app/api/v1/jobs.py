"""Job Description Analysis API Endpoints (Module 5)."""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.rate_limiter import ai_rate_limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.job_description import (
    JobDescriptionAnalysisResponse,
    JobDescriptionAnalyzeRequest,
    JobDescriptionCreateRequest,
    JobDescriptionResponse,
    JobDescriptionSummaryResponse,
    JobDescriptionUpdateRequest,
)
from app.services.job_description_service import JobDescriptionService

router = APIRouter(prefix="/jobs", tags=["Job Description Analysis (Module 5)"])


def check_ai_rate_limit(user_id: uuid.UUID) -> None:
    """Enforces per-candidate rate limits on AI analysis operations."""
    key = f"ai_jd_{user_id}"
    if not ai_rate_limiter.is_allowed(key, settings.rate_limit_ai_per_minute, window_seconds=60):
        retry_after = ai_rate_limiter.get_retry_after(key, window_seconds=60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded for AI evaluation. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )


@router.post(
    "/analyze",
    response_model=JobDescriptionAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a pasted Job Description without saving",
)
async def analyze_job_description(
    req: JobDescriptionAnalyzeRequest,
    current_user: User = Depends(get_current_active_user),
) -> JobDescriptionAnalysisResponse:
    """
    Parses untrusted pasted JD text and extracts categorized requirements,
    required/preferred skills, seniority, experience, education, tools, and ATS keywords.
    """
    check_ai_rate_limit(current_user.id)
    return await JobDescriptionService.analyze_unpersisted_jd(
        raw_text=req.raw_text,
        title=req.title,
        company=req.company,
        weights_config=req.weights_config,
    )


@router.post(
    "",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create, analyze, and persist a Job Description",
)
async def create_job_description(
    req: JobDescriptionCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> JobDescriptionResponse:
    """
    Extracts structured requirements and persists the job description
    entity for subsequent AI resume compatibility matching.
    """
    check_ai_rate_limit(current_user.id)
    jd = await JobDescriptionService.create_job_description(
        db=db,
        user_id=current_user.id,
        request=req,
    )
    return JobDescriptionService.to_response_dto(jd)


@router.get(
    "",
    response_model=list[JobDescriptionSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List all job descriptions for current candidate",
)
async def list_job_descriptions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> list[JobDescriptionSummaryResponse]:
    """Retrieves all target job postings submitted by the authenticated candidate."""
    jds = await JobDescriptionService.list_job_descriptions(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return [JobDescriptionService.to_summary_dto(jd) for jd in jds]


@router.get(
    "/{jd_id}",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get full job description details and structured requirements",
)
async def get_job_description(
    jd_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> JobDescriptionResponse:
    """Retrieves structured requirements and weights configuration with IDOR protection."""
    jd = await JobDescriptionService.get_job_description(
        db=db, user_id=current_user.id, jd_id=jd_id
    )
    return JobDescriptionService.to_response_dto(jd)


@router.put(
    "/{jd_id}",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update job description or weights configuration",
)
async def update_job_description(
    jd_id: uuid.UUID,
    req: JobDescriptionUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> JobDescriptionResponse:
    """Updates title, company, custom scoring weights, or re-runs analysis on updated text."""
    if req.reanalyze and req.raw_text:
        check_ai_rate_limit(current_user.id)

    jd = await JobDescriptionService.update_job_description(
        db=db, user_id=current_user.id, jd_id=jd_id, update_data=req
    )
    return JobDescriptionService.to_response_dto(jd)


@router.delete(
    "/{jd_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a job description",
)
async def delete_job_description(
    jd_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Permanently deletes a target job description and associated evaluation links."""
    await JobDescriptionService.delete_job_description(
        db=db, user_id=current_user.id, jd_id=jd_id
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{jd_id}/reanalyze",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Re-run AI requirement extraction on existing job description",
)
async def reanalyze_job_description(
    jd_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> JobDescriptionResponse:
    """Re-runs structured AI extraction against the stored JD text."""
    check_ai_rate_limit(current_user.id)
    jd = await JobDescriptionService.reanalyze_job_description(
        db=db, user_id=current_user.id, jd_id=jd_id
    )
    return JobDescriptionService.to_response_dto(jd)
