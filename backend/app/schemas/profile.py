"""Candidate Profile Pydantic Schemas with Field Validation."""

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ContactInfoSchema(BaseModel):
    """Candidate contact information schema."""

    phone: str | None = Field(default="", max_length=50)
    location: str | None = Field(default="", max_length=150)
    linkedin_url: str | None = Field(default="", max_length=255)
    github_url: str | None = Field(default="", max_length=255)
    portfolio_url: str | None = Field(default="", max_length=255)


class WorkExperienceSchema(BaseModel):
    """Work experience entry schema."""

    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str = Field(..., min_length=1, max_length=150)
    title: str = Field(..., min_length=1, max_length=150)
    location: str | None = Field(default="", max_length=150)
    start_date: str = Field(..., description="E.g. '2021-06' or 'June 2021'")
    end_date: str | None = Field(default="", description="E.g. '2023-08' or 'Present'")
    is_current: bool = Field(default=False)
    description: str | None = Field(default="")
    bullets: list[str] = Field(default_factory=list, description="Action-oriented bullet points")
    technologies: list[str] = Field(default_factory=list)


class EducationSchema(BaseModel):
    """Education history entry schema."""

    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
    institution: str = Field(..., min_length=1, max_length=200)
    degree: str = Field(..., min_length=1, max_length=150)
    field_of_study: str | None = Field(default="", max_length=150)
    start_date: str = Field(..., description="E.g. '2019'")
    end_date: str | None = Field(default="", description="E.g. '2023' or 'Present'")
    grade: str | None = Field(default="", description="CGPA or Percentage")


class SkillItemSchema(BaseModel):
    """Skill with proficiency and category."""

    name: str = Field(..., min_length=1, max_length=100)
    category: Literal["technical", "soft", "domain", "tool"] = Field(default="technical")
    proficiency: Literal["beginner", "intermediate", "expert"] = Field(default="intermediate")


class ProjectSchema(BaseModel):
    """Portfolio or academic project schema."""

    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=150)
    description: str = Field(default="")
    technologies: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)
    repo_url: str | None = Field(default="", max_length=255)
    demo_url: str | None = Field(default="", max_length=255)


class CertificationSchema(BaseModel):
    """Professional certification schema."""

    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=150)
    issuer: str = Field(..., min_length=1, max_length=150)
    issue_date: str | None = Field(default="")
    expiry_date: str | None = Field(default="")
    credential_id: str | None = Field(default="", max_length=100)
    url: str | None = Field(default="", max_length=255)


class CandidateProfileUpdateRequest(BaseModel):
    """Schema for updating candidate master profile facts."""

    headline: str | None = Field(default=None, max_length=255)
    summary: str | None = Field(default=None)
    contact_info: ContactInfoSchema | None = None
    skills: list[SkillItemSchema] | None = None
    experience: list[WorkExperienceSchema] | None = None
    education: list[EducationSchema] | None = None
    projects: list[ProjectSchema] | None = None
    certifications: list[CertificationSchema] | None = None
    achievements: list[str] | None = None
    publications: list[dict[str, Any]] | None = None
    links: list[dict[str, Any]] | None = None


class CandidateProfileResponse(BaseModel):
    """Candidate profile representation with computed completeness score."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    headline: str | None = ""
    summary: str | None = ""
    contact_info: dict[str, Any] = Field(default_factory=dict)
    skills: list[dict[str, Any]] = Field(default_factory=list)
    experience: list[dict[str, Any]] = Field(default_factory=list)
    education: list[dict[str, Any]] = Field(default_factory=list)
    projects: list[dict[str, Any]] = Field(default_factory=list)
    certifications: list[dict[str, Any]] = Field(default_factory=list)
    achievements: list[Any] = Field(default_factory=list)
    publications: list[Any] = Field(default_factory=list)
    links: list[Any] = Field(default_factory=list)
    profile_strength: int = Field(default=0, description="Completeness percentage 0-100")
    created_at: datetime
    updated_at: datetime
