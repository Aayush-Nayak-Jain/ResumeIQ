"""Parser Service coordinating Document Validation, Extraction, and Entity Mapping.

Enforces:
- Zero-trust untrusted file validation (T4.4, T4.5, T4.6)
- High-fidelity PDF & DOCX extraction (T4.1, T4.2, T4.3)
- PII-safe logging (no candidate emails, names, or resume bodies in logs)
- Schema normalization for ResumeIQ models
"""

import time
import uuid

from app.models.resume import Resume, ResumeVersion
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.schemas.parser import (
    ParsedResumeResponse,
    ParserMetadata,
)
from app.services.parser.docx_extractor import DOCXExtractor
from app.services.parser.entity_extractor import EntityExtractor
from app.services.parser.file_validator import DocumentValidator
from app.services.parser.pdf_extractor import PDFExtractor
from app.services.parser.section_segmenter import SectionSegmenter
from app.services.resume_service import ResumeService


class ParserService:
    """Orchestrates document parsing workflow and user-scoped resume persistence."""

    @classmethod
    def parse_document_bytes(
        cls,
        file_bytes: bytes,
        filename: str,
        content_type: str | None = None,
        user_id: uuid.UUID | None = None,
    ) -> ParsedResumeResponse:
        """
        Validates, extracts, and structures resume document bytes.

        Guarantees PII log hygiene: Candidate details are never logged.
        """
        start_time = time.perf_counter()

        # 1. Zero-trust document validation (T4.4, T4.5, T4.6)
        file_format = DocumentValidator.validate_document(
            filename=filename,
            content=file_bytes,
            content_type=content_type,
        )

        # 2. Format-specific extraction
        if file_format == "pdf":
            raw_text = PDFExtractor.extract_text(file_bytes)
        elif file_format == "docx":
            raw_text = DOCXExtractor.extract_text(file_bytes)
        else:
            raw_text = ""

        # 3. Section boundary segmentation
        sections, detected_sections = SectionSegmenter.segment_document(raw_text)

        # 4. Entity & structured data extraction
        structured_data = EntityExtractor.extract_structured_data(sections, raw_text)

        # 5. Diagnostic metrics & ATS completeness score
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        dict_payload = structured_data.model_dump()
        completeness_score = ResumeService.calculate_completeness(dict_payload)

        # Confidence calculation based on section presence
        confidence = 0
        if structured_data.personal_info.full_name or structured_data.personal_info.email:
            confidence += 30
        if structured_data.skills:
            confidence += 25
        if structured_data.experience:
            confidence += 25
        if structured_data.education:
            confidence += 20

        metadata = ParserMetadata(
            file_name=filename,
            file_type=file_format,
            file_size_bytes=len(file_bytes),
            parsing_duration_ms=elapsed_ms,
            detected_sections=detected_sections,
            section_counts={
                "experience": len(structured_data.experience),
                "education": len(structured_data.education),
                "skills": len(structured_data.skills),
                "projects": len(structured_data.projects),
                "certifications": len(structured_data.certifications),
            },
            confidence_score=min(100, confidence),
        )

        # Safe logging: Log only execution metadata, never PII
        logger.info(
            "Parsed resume document [user_id=%s, format=%s, size=%d, ms=%.1f, sections=%d]",
            user_id or "anonymous",
            file_format,
            len(file_bytes),
            elapsed_ms,
            len(detected_sections),
        )

        return ParsedResumeResponse(
            raw_text=raw_text,
            structured_data=structured_data,
            metadata=metadata,
            completeness_score=completeness_score,
        )

    @classmethod
    async def parse_and_create_resume(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        file_bytes: bytes,
        filename: str,
        content_type: str | None = None,
        custom_title: str | None = None,
        is_master: bool = False,
    ) -> tuple[Resume, ParsedResumeResponse]:
        """
        Parses uploaded resume file and immediately persists it into the database
        as a structured Resume entity with Version 1 history snapshot.
        """
        parsed = cls.parse_document_bytes(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
            user_id=user_id,
        )

        # Determine resume title
        title = custom_title.strip() if custom_title and custom_title.strip() else f"Parsed Resume - {filename.rsplit('.', 1)[0]}"

        # If marking as master, demote existing masters
        if is_master:
            from sqlalchemy import select

            existing_masters = await db.scalars(select(Resume).where(Resume.user_id == user_id, Resume.is_master.is_(True)))
            for m in existing_masters:
                m.is_master = False

        structured_dict = parsed.structured_data.model_dump()

        resume = Resume(
            id=uuid.uuid4(),
            user_id=user_id,
            title=title,
            target_role=structured_dict.get("summary", "")[:50] or "Imported Profile",
            is_master=is_master,
            version_number=1,
            raw_text=parsed.raw_text,
            structured_data=structured_dict,
            file_name=filename,
            file_type=parsed.metadata.file_type,
            file_size_bytes=parsed.metadata.file_size_bytes,
            status="imported",
        )
        db.add(resume)
        await db.flush()

        version = ResumeVersion(
            id=uuid.uuid4(),
            resume_id=resume.id,
            user_id=user_id,
            version_number=1,
            role_name=resume.target_role,
            structured_data=structured_dict,
            diff_summary={
                "action": "imported_from_document",
                "file_name": filename,
                "file_type": parsed.metadata.file_type,
            },
        )
        db.add(version)

        await db.commit()
        await db.refresh(resume)

        logger.info(
            "Created resume from parsed document [resume_id=%s, user_id=%s, is_master=%s]",
            resume.id,
            user_id,
            resume.is_master,
        )

        return resume, parsed
