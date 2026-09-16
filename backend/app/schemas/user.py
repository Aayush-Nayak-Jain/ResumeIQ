"""User and Authentication Pydantic Schemas."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRegisterRequest(BaseModel):
    """Schema for candidate or admin account registration."""

    email: EmailStr = Field(..., description="Valid candidate or admin email address")
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (minimum 8 characters)",
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Candidate's full legal name",
    )
    role: Literal["candidate", "admin"] = Field(
        default="candidate",
        description="Role: candidate or admin only",
    )

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        return v


class UserLoginRequest(BaseModel):
    """Schema for user credentials authentication."""

    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Plain password")


class RefreshTokenRequest(BaseModel):
    """Schema for rotating and refreshing access tokens."""

    refresh_token: str = Field(..., description="Valid signed JWT refresh token")


class UserResponse(BaseModel):
    """Safe user profile response omitting credentials."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    """Token response returned upon successful authentication."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
