"""Job Description Service managing DB persistence, user-scoped access, and analysis workflows."""

import uuid
from collections.abc import Sequence

from app.models.job_description import JobDescription
from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.schemas.job_description import (
    CategorizedRequirements,
    JobDescriptionAnalysisResponse,
    JobDescriptionCreateRequest,
    JobDescriptionResponse,
    JobDescriptionSummaryResponse,
    JobDescriptionUpdateRequest,
    WeightsConfig,
)
from app.services.ai.jd_analyzer import JobDescriptionAnalyzer


class JobDescriptionService:
    """Provides business logic and IDOR-safe database operations for Job Descriptions."""

    @classmethod
    async def analyze_unpersisted_jd(
        cls,
        raw_text: str,
        title: str | None = None,
        company: str | None = None,
        weights_config: WeightsConfig | None = None,
        force_nlp_only: bool = False,
    ) -> JobDescriptionAnalysisResponse:
        """Analyzes a job description without saving to database."""
        return await JobDescriptionAnalyzer.analyze_job_description(
            raw_text=raw_text,
            title=title,
            company=company,
            custom_weights=weights_config,
            force_nlp_only=force_nlp_only,
        )

    @classmethod
    async def create_job_description(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        request: JobDescriptionCreateRequest,
        force_nlp_only: bool = False,
    ) -> JobDescription:
        """
        Analyzes and saves a target Job Description for the authenticated user.
        """
        analysis = await JobDescriptionAnalyzer.analyze_job_description(
            raw_text=request.raw_text,
            title=request.title,
            company=request.company,
            custom_weights=request.weights_config,
            force_nlp_only=force_nlp_only,
        )

        final_title = request.title.strip() if request.title and request.title.strip() else analysis.structured_requirements.job_title or "Target Role"
        final_company = request.company.strip() if request.company and request.company.strip() else analysis.structured_requirements.company

        jd = JobDescription(
            id=uuid.uuid4(),
            user_id=user_id,
            title=final_title,
            company=final_company,
            raw_text=request.raw_text.strip(),
            structured_requirements=analysis.structured_requirements.model_dump(),
            weights_config=analysis.weights_config.model_dump(),
        )

        db.add(jd)
        await db.commit()
        await db.refresh(jd)

        logger.info(
            "Created job description [jd_id=%s, user_id=%s, title='%s']",
            jd.id,
            user_id,
            jd.title,
        )
        return jd

    @classmethod
    async def get_job_description(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        jd_id: uuid.UUID,
    ) -> JobDescription:
        """Fetches a single JD with strict IDOR verification."""
        stmt = select(JobDescription).where(
            JobDescription.id == jd_id,
            JobDescription.user_id == user_id,
        )
        result = await db.scalar(stmt)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job description not found or you do not have permission to access it.",
            )
        return result

    @classmethod
    async def list_job_descriptions(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> Sequence[JobDescription]:
        """Lists all job descriptions belonging to the authenticated user."""
        stmt = select(JobDescription).where(JobDescription.user_id == user_id).order_by(desc(JobDescription.created_at)).offset(skip).limit(limit)
        result = await db.scalars(stmt)
        return result.all()

    @classmethod
    async def update_job_description(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        jd_id: uuid.UUID,
        update_data: JobDescriptionUpdateRequest,
    ) -> JobDescription:
        """Updates and optionally reanalyzes an existing job description."""
        jd = await cls.get_job_description(db, user_id, jd_id)

        if update_data.title is not None:
            jd.title = update_data.title.strip()
        if update_data.company is not None:
            jd.company = update_data.company.strip()
        if update_data.weights_config is not None:
            jd.weights_config = update_data.weights_config.model_dump()

        if update_data.raw_text is not None and update_data.raw_text.strip() != jd.raw_text:
            jd.raw_text = update_data.raw_text.strip()
            if update_data.reanalyze:
                analysis = await JobDescriptionAnalyzer.analyze_job_description(
                    raw_text=jd.raw_text,
                    title=jd.title,
                    company=jd.company,
                    custom_weights=WeightsConfig.model_validate(jd.weights_config),
                )
                jd.structured_requirements = analysis.structured_requirements.model_dump()

        await db.commit()
        await db.refresh(jd)
        return jd

    @classmethod
    async def reanalyze_job_description(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        jd_id: uuid.UUID,
        force_nlp_only: bool = False,
    ) -> JobDescription:
        """Re-runs structured AI requirement extraction on stored JD text."""
        jd = await cls.get_job_description(db, user_id, jd_id)
        analysis = await JobDescriptionAnalyzer.analyze_job_description(
            raw_text=jd.raw_text,
            title=jd.title,
            company=jd.company,
            custom_weights=WeightsConfig.model_validate(jd.weights_config),
            force_nlp_only=force_nlp_only,
        )
        jd.structured_requirements = analysis.structured_requirements.model_dump()
        jd.weights_config = analysis.weights_config.model_dump()

        await db.commit()
        await db.refresh(jd)
        return jd

    @classmethod
    async def delete_job_description(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        jd_id: uuid.UUID,
    ) -> None:
        """Deletes a job description ensuring user authorization."""
        jd = await cls.get_job_description(db, user_id, jd_id)
        await db.delete(jd)
        await db.commit()
        logger.info("Deleted job description [jd_id=%s, user_id=%s]", jd_id, user_id)

    @classmethod
    def to_response_dto(cls, jd: JobDescription) -> JobDescriptionResponse:
        """Converts ORM model to response DTO."""
        return JobDescriptionResponse(
            id=jd.id,
            user_id=jd.user_id,
            title=jd.title,
            company=jd.company,
            raw_text=jd.raw_text,
            structured_requirements=CategorizedRequirements.model_validate(jd.structured_requirements),
            weights_config=WeightsConfig.model_validate(jd.weights_config),
            created_at=jd.created_at,
            updated_at=jd.updated_at,
        )

    @classmethod
    def to_summary_dto(cls, jd: JobDescription) -> JobDescriptionSummaryResponse:
        """Converts ORM model to compact summary DTO."""
        req = jd.structured_requirements or {}
        req_skills = req.get("required_skills", [])
        tools = req.get("tools_and_technologies", [])
        seniority = req.get("seniority_level", "Not Specified")

        return JobDescriptionSummaryResponse(
            id=jd.id,
            title=jd.title,
            company=jd.company,
            required_skills_count=len(req_skills),
            tools_count=len(tools),
            seniority_level=seniority,
            created_at=jd.created_at,
            updated_at=jd.updated_at,
        )
