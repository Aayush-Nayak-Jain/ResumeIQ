"""Resume Pydantic Schemas with Completeness Calculation."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ResumeCreateRequest(BaseModel):
    """Schema for creating a new master or tailored resume."""

    title: str = Field(..., min_length=1, max_length=255, description="Resume title label")
    target_role: str | None = Field(default="", max_length=255)
    is_master: bool = Field(default=False)
    parent_version_id: uuid.UUID | None = None
    structured_data: dict[str, Any] = Field(default_factory=dict)


class ResumeUpdateRequest(BaseModel):
    """Schema for updating an existing resume document."""

    title: str | None = Field(default=None, max_length=255)
    target_role: str | None = Field(default=None, max_length=255)
    is_master: bool | None = None
    structured_data: dict[str, Any] | None = None
    status: str | None = Field(default=None)


class ResumeVersionResponse(BaseModel):
    """Schema for a historical resume snapshot version."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    resume_id: uuid.UUID
    version_number: int
    role_name: str
    structured_data: dict[str, Any]
    diff_summary: dict[str, Any] | None = None


class ResumeResponse(BaseModel):
    """Full resume document schema with computed ATS completeness metric."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    target_role: str | None = ""
    is_master: bool = False
    parent_version_id: uuid.UUID | None = None
    version_number: int = 1
    raw_text: str | None = None
    structured_data: dict[str, Any] = Field(default_factory=dict)
    file_url: str | None = None
    file_name: str | None = None
    file_type: str | None = None
    file_size_bytes: int | None = None
    status: str = "draft"
    completeness_score: int = Field(default=0, description="Completeness percentage 0-100")
    created_at: datetime
    updated_at: datetime


class ResumeListResponse(BaseModel):
    """Lightweight resume representation for dashboard list view."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    target_role: str | None = ""
    is_master: bool
    version_number: int
    status: str
    completeness_score: int = 0
    created_at: datetime
    updated_at: datetime
