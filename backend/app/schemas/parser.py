"""Resume Parser Schemas for Module 4."""

from typing import Literal

from pydantic import BaseModel, Field


class ParsedContactInfo(BaseModel):
    """Extracted contact and social links."""

    full_name: str | None = Field(default="", max_length=150)
    email: str | None = Field(default="", max_length=150)
    phone: str | None = Field(default="", max_length=50)
    location: str | None = Field(default="", max_length=150)
    linkedin_url: str | None = Field(default="", max_length=255)
    github_url: str | None = Field(default="", max_length=255)
    portfolio_url: str | None = Field(default="", max_length=255)


class ParsedWorkExperience(BaseModel):
    """Extracted work experience entry."""

    id: str = Field(default="")
    company: str = Field(default="", max_length=150)
    title: str = Field(default="", max_length=150)
    location: str | None = Field(default="", max_length=150)
    start_date: str = Field(default="")
    end_date: str | None = Field(default="")
    is_current: bool = Field(default=False)
    bullets: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)


class ParsedEducation(BaseModel):
    """Extracted education entry."""

    id: str = Field(default="")
    institution: str = Field(default="", max_length=200)
    degree: str = Field(default="", max_length=150)
    field_of_study: str | None = Field(default="", max_length=150)
    start_date: str = Field(default="")
    end_date: str | None = Field(default="")
    grade: str | None = Field(default="", max_length=50)


class ParsedSkill(BaseModel):
    """Extracted skill item with category."""

    name: str = Field(..., min_length=1, max_length=100)
    category: Literal["technical", "soft", "domain", "tool"] = Field(default="technical")
    proficiency: Literal["beginner", "intermediate", "expert"] = Field(default="intermediate")


class ParsedProject(BaseModel):
    """Extracted project entry."""

    id: str = Field(default="")
    title: str = Field(default="", max_length=150)
    description: str = Field(default="")
    technologies: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)
    repo_url: str | None = Field(default="", max_length=255)
    demo_url: str | None = Field(default="", max_length=255)


class ParsedCertification(BaseModel):
    """Extracted certification entry."""

    id: str = Field(default="")
    name: str = Field(default="", max_length=150)
    issuer: str = Field(default="", max_length=150)
    issue_date: str | None = Field(default="")
    credential_id: str | None = Field(default="", max_length=100)
    url: str | None = Field(default="", max_length=255)


class ParserMetadata(BaseModel):
    """Document parsing diagnostics and execution metadata."""

    file_name: str
    file_type: str
    file_size_bytes: int
    parsing_duration_ms: float
    detected_sections: list[str] = Field(default_factory=list)
    section_counts: dict[str, int] = Field(default_factory=dict)
    confidence_score: int = Field(default=0, description="Estimated extraction confidence 0-100")


class ParsedResumeStructuredData(BaseModel):
    """Normalized structured resume payload compatible with ResumeIQ models."""

    personal_info: ParsedContactInfo = Field(default_factory=ParsedContactInfo)
    summary: str = Field(default="")
    experience: list[ParsedWorkExperience] = Field(default_factory=list)
    education: list[ParsedEducation] = Field(default_factory=list)
    skills: list[ParsedSkill] = Field(default_factory=list)
    projects: list[ParsedProject] = Field(default_factory=list)
    certifications: list[ParsedCertification] = Field(default_factory=list)


class ParsedResumeResponse(BaseModel):
    """Complete response payload returned by resume parse endpoints."""

    raw_text: str = Field(..., description="Cleaned, sanitized plain text extracted from document")
    structured_data: ParsedResumeStructuredData
    metadata: ParserMetadata
    completeness_score: int = Field(default=0, description="ATS profile completeness score 0-100")
