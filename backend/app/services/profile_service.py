"""Candidate Profile Service for Single Source of Truth Fact Management."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models.candidate_profile import CandidateProfile
from app.schemas.profile import CandidateProfileResponse, CandidateProfileUpdateRequest


class ProfileService:
    """Service handling candidate profile CRUD and completeness evaluation."""

    @staticmethod
    async def get_or_create_profile(db: AsyncSession, user_id: uuid.UUID) -> CandidateProfile:
        """Retrieves or creates candidate master profile for the user."""
        profile = await db.scalar(
            select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        )
        if not profile:
            profile = CandidateProfile(
                id=uuid.uuid4(),
                user_id=user_id,
                headline="",
                summary="",
                contact_info={},
                skills=[],
                experience=[],
                education=[],
                projects=[],
                certifications=[],
                achievements=[],
                publications=[],
                links=[],
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
            logger.info("Initialized new candidate master profile for user_id=%s", user_id)
        return profile

    @staticmethod
    async def update_profile(
        db: AsyncSession, user_id: uuid.UUID, req: CandidateProfileUpdateRequest
    ) -> CandidateProfile:
        """Updates candidate profile facts while preserving unmentioned fields."""
        profile = await ProfileService.get_or_create_profile(db, user_id)

        update_dict = req.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            if hasattr(profile, field) and value is not None:
                setattr(profile, field, value)

        await db.commit()
        await db.refresh(profile)
        logger.info("Updated candidate master profile for user_id=%s", user_id)
        return profile

    @staticmethod
    def calculate_profile_strength(profile: CandidateProfile) -> int:
        """Calculates profile factual completeness percentage (0–100)."""
        score = 0

        # Headline & Summary
        if profile.headline and len(profile.headline.strip()) > 5:
            score += 10
        if profile.summary and len(profile.summary.strip()) > 30:
            score += 15

        # Contact info
        contact = profile.contact_info or {}
        if contact.get("phone") or contact.get("location"):
            score += 10
        if contact.get("linkedin_url") or contact.get("github_url") or contact.get("portfolio_url"):
            score += 5

        # Experience
        if profile.experience and len(profile.experience) > 0:
            score += 25

        # Education
        if profile.education and len(profile.education) > 0:
            score += 15

        # Skills
        if profile.skills and len(profile.skills) >= 3:
            score += 10
        elif profile.skills and len(profile.skills) > 0:
            score += 5

        # Projects
        if profile.projects and len(profile.projects) > 0:
            score += 10

        return min(100, score)

    @staticmethod
    def to_response_dto(profile: CandidateProfile) -> CandidateProfileResponse:
        """Converts ORM model to response DTO with calculated strength."""
        dto = CandidateProfileResponse.model_validate(profile)
        dto.profile_strength = ProfileService.calculate_profile_strength(profile)
        return dto
