"""Authentication and Identity API Router (Module 1)."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Identity & Access"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account",
)
async def register(
    req: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Registers a new candidate or administrator and returns an access & refresh token pair."""
    user = await AuthService.register_user(db=db, req=req)
    return AuthService.create_token_pair(user=user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user credentials",
)
async def login(
    req: UserLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Validates user credentials against brute-force rate limits and issues JWT token pair."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    user = await AuthService.authenticate_user(db=db, req=req, client_ip=client_ip)
    return AuthService.create_token_pair(user=user)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
)
async def refresh(
    req: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Rotates refresh token and issues a new valid token pair."""
    return await AuthService.refresh_tokens(db=db, refresh_token_str=req.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    """Retrieves profile information for the currently authenticated user."""
    return UserResponse.model_validate(current_user)


@router.get(
    "/admin/users",
    response_model=list[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List all users (Admin only)",
)
async def list_users_admin(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[UserResponse]:
    """Admin-only endpoint to inspect user accounts."""
    result = await db.scalars(select(User).order_by(User.created_at.desc()))
    users = result.all()
    return [UserResponse.model_validate(u) for u in users]
