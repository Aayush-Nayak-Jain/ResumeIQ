"""Authentication and User Management Service."""

import uuid

from app.models.candidate_profile import CandidateProfile
from app.models.user import User
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.core.rate_limiter import auth_rate_limiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.schemas.user import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)


class AuthService:
    """Service handling registration, credential validation, and token issuance."""

    @staticmethod
    async def register_user(db: AsyncSession, req: UserRegisterRequest) -> User:
        """Registers a new candidate or admin user account with hashed credentials."""
        # 1. Duplicate email check (T1.2)
        existing = await db.scalar(select(User).where(User.email == req.email.strip().lower()))
        if existing:
            logger.warning("Registration rejected: duplicate email attempted")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists",
            )

        # 2. Hash password securely (never plaintext - T1.1)
        hashed_pwd = get_password_hash(req.password)

        # 3. Create user entity
        user = User(
            id=uuid.uuid4(),
            email=req.email.strip().lower(),
            password_hash=hashed_pwd,
            full_name=req.full_name.strip(),
            role=req.role,
            is_active=True,
        )
        db.add(user)
        await db.flush()

        # 4. Auto-initialize empty candidate profile if role is candidate
        if user.role == "candidate":
            profile = CandidateProfile(
                id=uuid.uuid4(),
                user_id=user.id,
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
        await db.refresh(user)
        logger.info("User registered successfully [user_id=%s, role=%s]", user.id, user.role)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, req: UserLoginRequest, client_ip: str) -> User:
        """Validates login credentials with brute-force rate limit protection."""
        rate_limit_key = f"auth_fail:{client_ip}:{req.email.strip().lower()}"

        # 1. Check brute-force throttling (T1.6)
        if not auth_rate_limiter.is_allowed(
            key=rate_limit_key,
            max_requests=settings.rate_limit_login_per_minute,
            window_seconds=60,
        ):
            retry_after = auth_rate_limiter.get_retry_after(rate_limit_key, 60)
            logger.warning("Authentication throttled: brute-force limit reached for IP")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed login attempts. Please retry in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )

        # 2. Query user by email
        user = await db.scalar(select(User).where(User.email == req.email.strip().lower()))

        # 3. Verify password (T1.3)
        if not user or not verify_password(req.password, user.password_hash):
            logger.warning("Failed login attempt for email")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 4. Check account status
        if not user.is_active:
            logger.warning("Login rejected: inactive user account [user_id=%s]", user.id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated. Please contact support.",
            )

        # 5. Clear rate limit on successful authentication
        auth_rate_limiter.reset(rate_limit_key)
        logger.info("User authenticated successfully [user_id=%s, role=%s]", user.id, user.role)
        return user

    @staticmethod
    def create_token_pair(user: User) -> TokenResponse:
        """Generates access and refresh tokens for an authenticated user."""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    async def refresh_tokens(db: AsyncSession, refresh_token_str: str) -> TokenResponse:
        """Validates refresh token and issues a new token pair."""
        try:
            payload = decode_token(refresh_token_str)
        except Exception as exc:
            logger.warning("Token refresh failed: invalid token signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type for refresh",
            )

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token subject",
            )

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed token user ID",
            ) from exc

        user = await db.scalar(select(User).where(User.id == user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or deactivated",
            )

        return AuthService.create_token_pair(user)
