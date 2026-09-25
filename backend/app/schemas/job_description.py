"""Job Description Analysis Schemas for Module 5."""

import uuid
from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator


class WeightsConfig(BaseModel):
    """Configurable scoring weights for ATS & AI evaluation (Section 5.3)."""

    skills: float = Field(default=0.40, ge=0.0, le=1.0, description="Weight for skill match")
    experience: float = Field(default=0.20, ge=0.0, le=1.0, description="Weight for experience match")
    projects: float = Field(default=0.15, ge=0.0, le=1.0, description="Weight for project relevance")
    education: float = Field(default=0.10, ge=0.0, le=1.0, description="Weight for education match")
    semantic_similarity: float = Field(default=0.10, ge=0.0, le=1.0, description="Weight for semantic similarity")
    certifications: float = Field(default=0.05, ge=0.0, le=1.0, description="Weight for certifications")

    @field_validator("certifications")
    @classmethod
    def validate_total_weights(cls, v: float, info: Any) -> float:
        # Validate that the sum of all weights roughly equals 1.0
        data = info.data
        if "skills" in data and "experience" in data and "projects" in data and "education" in data and "semantic_similarity" in data:
            total = data["skills"] + data["experience"] + data["projects"] + data["education"] + data["semantic_similarity"] + v
            if not (0.95 <= total <= 1.05):
                raise ValueError(f"Sum of weights must equal 1.0 (currently {round(total, 2)})")
        return v


class SkillRequirement(BaseModel):
    """Detailed skill requirement item extracted from JD."""

    name: str = Field(..., min_length=1, max_length=100)
    category: Literal["technical", "soft", "domain", "tool", "methodology"] = Field(default="technical")
    importance: Literal["required", "preferred", "bonus"] = Field(default="required")
    weight: float = Field(default=1.0, ge=0.1, le=1.0, description="Relative priority 0.1-1.0")
    context: str | None = Field(default=None, max_length=300, description="Context or years requested")


class ExperienceRequirement(BaseModel):
    """Experience requirements extracted from JD."""

    min_years: float | None = Field(default=None, ge=0.0, le=50.0)
    max_years: float | None = Field(default=None, ge=0.0, le=50.0)
    seniority_level: Literal["Intern", "Entry-Level", "Mid-Level", "Senior", "Lead / Staff", "Executive", "Not Specified"] = Field(
        default="Not Specified"
    )
    details: list[str] = Field(default_factory=list)


class EducationRequirement(BaseModel):
    """Education requirements extracted from JD."""

    degree_level: Literal["High School / Diploma", "Bachelor's", "Master's", "PhD / Doctorate", "Not Specified"] = Field(
        default="Not Specified"
    )
    fields_of_study: list[str] = Field(default_factory=list)
    is_required: bool = Field(default=False)
    details: list[str] = Field(default_factory=list)


class CategorizedRequirements(BaseModel):
    """Structured and categorized requirements extracted from a single Job Description."""

    job_title: str = Field(default="Target Role", max_length=150)
    company: str | None = Field(default=None, max_length=150)
    summary: str = Field(default="")
    seniority_level: str = Field(default="Not Specified")
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    skills_detailed: list[SkillRequirement] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    experience_requirements: ExperienceRequirement = Field(default_factory=ExperienceRequirement)
    education_requirements: EducationRequirement = Field(default_factory=EducationRequirement)
    tools_and_technologies: list[str] = Field(default_factory=list)
    domain_knowledge: list[str] = Field(default_factory=list)
    behavioral_expectations: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list, description="High-salience ATS keywords")


class JobDescriptionAnalyzeRequest(BaseModel):
    """Request payload for analyzing a pasted job description (without necessarily saving)."""

    raw_text: str = Field(
        ...,
        min_length=20,
        max_length=50000,
        description="Pasted job description text (untrusted user input)",
    )
    title: str | None = Field(default=None, max_length=255)
    company: str | None = Field(default=None, max_length=255)
    weights_config: WeightsConfig | None = Field(default=None)


class JobDescriptionCreateRequest(BaseModel):
    """Request payload for creating and persisting a job description entity."""

    raw_text: str = Field(
        ...,
        min_length=20,
        max_length=50000,
        description="Pasted job description text (untrusted user input)",
    )
    title: str | None = Field(default=None, max_length=255)
    company: str | None = Field(default=None, max_length=255)
    weights_config: WeightsConfig | None = Field(default=None)


class JobDescriptionUpdateRequest(BaseModel):
    """Request payload for updating an existing job description."""

    title: str | None = Field(default=None, max_length=255)
    company: str | None = Field(default=None, max_length=255)
    raw_text: str | None = Field(default=None, min_length=20, max_length=50000)
    weights_config: WeightsConfig | None = Field(default=None)
    reanalyze: bool = Field(default=False, description="Whether to re-run AI extraction if raw_text was updated")


class JobDescriptionAnalysisMetadata(BaseModel):
    """Diagnostics and telemetry for JD extraction."""

    extraction_duration_ms: float
    llm_provider: str
    llm_model: str
    character_count: int
    word_count: int
    required_skills_count: int
    preferred_skills_count: int
    responsibilities_count: int
    tools_count: int


class JobDescriptionAnalysisResponse(BaseModel):
    """Response returned when analyzing a job description."""

    structured_requirements: CategorizedRequirements
    weights_config: WeightsConfig
    metadata: JobDescriptionAnalysisMetadata


class JobDescriptionResponse(BaseModel):
    """Full persisted Job Description model response."""

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    company: str | None = None
    raw_text: str
    structured_requirements: CategorizedRequirements
    weights_config: WeightsConfig
    created_at: datetime
    updated_at: datetime


class JobDescriptionSummaryResponse(BaseModel):
    """Compact summary response for listing job descriptions."""

    id: uuid.UUID
    title: str
    company: str | None = None
    required_skills_count: int
    tools_count: int
    seniority_level: str
    created_at: datetime
    updated_at: datetime
