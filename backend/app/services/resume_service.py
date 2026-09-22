"""Resume Management Service with Version History and IDOR Isolation."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models.resume import Resume, ResumeVersion
from app.schemas.resume import (
    ResumeCreateRequest,
    ResumeListResponse,
    ResumeResponse,
    ResumeUpdateRequest,
)


class ResumeService:
    """Service handling resume creation, versioning, and secure user-scoped CRUD."""

    @staticmethod
    def calculate_completeness(data: dict) -> int:
        """Calculates ATS document completeness percentage (0–100)."""
        score = 0
        if not data:
            return 0

        # Contact / Header info
        header = data.get("personal_info") or data.get("contact_info") or {}
        if header.get("full_name") or header.get("name"):
            score += 10
        if header.get("email"):
            score += 10
        if header.get("phone") or header.get("location"):
            score += 5

        # Summary
        summary = data.get("summary") or ""
        if len(str(summary).strip()) > 30:
            score += 15

        # Experience
        exp = data.get("experience") or []
        if len(exp) >= 2:
            score += 25
        elif len(exp) == 1:
            score += 15

        # Education
        edu = data.get("education") or []
        if len(edu) >= 1:
            score += 15

        # Skills
        skills = data.get("skills") or []
        if len(skills) >= 5:
            score += 10
        elif len(skills) > 0:
            score += 5

        # Projects
        projects = data.get("projects") or []
        if len(projects) >= 1:
            score += 10

        return min(100, score)

    @staticmethod
    async def create_resume(
        db: AsyncSession, user_id: uuid.UUID, req: ResumeCreateRequest
    ) -> Resume:
        """Creates a new master or tailored resume document."""
        # If marked as master, unset any prior master resumes for this user
        if req.is_master:
            existing_masters = await db.scalars(
                select(Resume).where(Resume.user_id == user_id, Resume.is_master.is_(True))
            )
            for old_master in existing_masters:
                old_master.is_master = False

        resume = Resume(
            id=uuid.uuid4(),
            user_id=user_id,
            title=req.title.strip(),
            target_role=req.target_role.strip() if req.target_role else "",
            is_master=req.is_master,
            parent_version_id=req.parent_version_id,
            version_number=1,
            structured_data=req.structured_data or {},
            status="draft",
        )
        db.add(resume)
        await db.flush()

        # Create initial Version 1 snapshot
        version = ResumeVersion(
            id=uuid.uuid4(),
            resume_id=resume.id,
            user_id=user_id,
            version_number=1,
            role_name=resume.target_role or "Initial Version",
            structured_data=resume.structured_data,
            diff_summary={"action": "created", "version": 1},
        )
        db.add(version)

        await db.commit()
        await db.refresh(resume)
        logger.info(
            "Created resume [id=%s, user_id=%s, is_master=%s]",
            resume.id,
            user_id,
            resume.is_master,
        )
        return resume

    @staticmethod
    async def list_resumes(db: AsyncSession, user_id: uuid.UUID) -> list[ResumeListResponse]:
        """Lists resumes strictly belonging to authenticated user (zero-trust IDOR defense)."""
        result = await db.scalars(
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.is_master.desc(), Resume.updated_at.desc())
        )
        resumes = result.all()
        responses = []
        for r in resumes:
            dto = ResumeListResponse.model_validate(r)
            dto.completeness_score = ResumeService.calculate_completeness(r.structured_data)
            responses.append(dto)
        return responses

    @staticmethod
    async def get_resume_by_id(
        db: AsyncSession, resume_id: uuid.UUID, user_id: uuid.UUID
    ) -> Resume:
        """Fetches a single resume with strict user ownership validation."""
        resume = await db.scalar(
            select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
        )
        if not resume:
            logger.warning(
                "Resume access denied or not found [resume_id=%s, user_id=%s]",
                resume_id,
                user_id,
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found or you do not have permission to access it.",
            )
        return resume

    @staticmethod
    async def update_resume(
        db: AsyncSession, resume_id: uuid.UUID, user_id: uuid.UUID, req: ResumeUpdateRequest
    ) -> Resume:
        """Updates resume fields and records an incremental version snapshot."""
        resume = await ResumeService.get_resume_by_id(db, resume_id, user_id)

        update_dict = req.model_dump(exclude_unset=True)
        structured_data_changed = (
            "structured_data" in update_dict and update_dict["structured_data"] is not None
        )

        if "title" in update_dict and update_dict["title"] is not None:
            resume.title = update_dict["title"].strip()
        if "target_role" in update_dict and update_dict["target_role"] is not None:
            resume.target_role = update_dict["target_role"].strip()
        if "status" in update_dict and update_dict["status"] is not None:
            resume.status = update_dict["status"]

        if structured_data_changed:
            resume.structured_data = update_dict["structured_data"]
            resume.version_number += 1

            # Snapshot revision in resume_versions
            version = ResumeVersion(
                id=uuid.uuid4(),
                resume_id=resume.id,
                user_id=user_id,
                version_number=resume.version_number,
                role_name=resume.target_role or f"Version {resume.version_number}",
                structured_data=resume.structured_data,
                diff_summary={"action": "updated", "version": resume.version_number},
            )
            db.add(version)

        await db.commit()
        await db.refresh(resume)
        logger.info("Updated resume [id=%s, v=%s]", resume.id, resume.version_number)
        return resume

    @staticmethod
    async def delete_resume(db: AsyncSession, resume_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Deletes a resume and associated snapshots."""
        resume = await ResumeService.get_resume_by_id(db, resume_id, user_id)
        await db.delete(resume)
        await db.commit()
        logger.info("Deleted resume [id=%s, user_id=%s]", resume_id, user_id)

    @staticmethod
    def to_response_dto(resume: Resume) -> ResumeResponse:
        """Maps ORM model to response DTO with calculated completeness score."""
        dto = ResumeResponse.model_validate(resume)
        dto.completeness_score = ResumeService.calculate_completeness(resume.structured_data)
        return dto
