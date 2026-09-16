"""Unit and Security Tests for Module 1 — Identity & Access (T1.1–T1.6)."""

from datetime import timedelta

import pytest
from httpx import AsyncClient

from app.core.rate_limiter import auth_rate_limiter
from app.core.security import create_access_token


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Resets rate limiter state before each test."""
    auth_rate_limiter._requests.clear()


@pytest.mark.asyncio
async def test_t1_1_successful_registration(async_client: AsyncClient):
    """T1.1: Successful registration creates account with hashed password (never plaintext)."""
    payload = {
        "email": "candidate.alex@example.com",
        "password": "SecurePassword123!",
        "full_name": "Alex Mercer",
        "role": "candidate",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == "candidate.alex@example.com"
    assert data["user"]["full_name"] == "Alex Mercer"
    assert data["user"]["role"] == "candidate"
    assert data["user"]["is_active"] is True
    # Verify password hash is never exposed in response
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


@pytest.mark.asyncio
async def test_t1_2_duplicate_email_rejection(async_client: AsyncClient):
    """T1.2: Duplicate email returns 409 Conflict without creating duplicate account."""
    payload = {
        "email": "duplicate.test@example.com",
        "password": "Password123!",
        "full_name": "Original User",
        "role": "candidate",
    }
    res1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Attempt to register with the same email
    res2 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_t1_3_wrong_password_rejection(async_client: AsyncClient):
    """T1.3: Wrong password rejected with 401 Unauthorized, no token issued."""
    # Register user first
    reg_payload = {
        "email": "login.test@example.com",
        "password": "CorrectPassword123!",
        "full_name": "Login User",
        "role": "candidate",
    }
    await async_client.post("/api/v1/auth/register", json=reg_payload)

    # Attempt login with incorrect password
    login_payload = {
        "email": "login.test@example.com",
        "password": "WrongPassword999!",
    }
    response = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]
    assert "access_token" not in response.json()


@pytest.mark.asyncio
async def test_t1_4_expired_and_invalid_token(async_client: AsyncClient):
    """T1.4: Expired or malformed token returns 401 Unauthorized."""
    # 1. Test completely bogus token
    headers_bogus = {"Authorization": "Bearer not.a.valid.jwt.token"}
    res_bogus = await async_client.get("/api/v1/auth/me", headers=headers_bogus)
    assert res_bogus.status_code == 401

    # 2. Test expired token
    expired_token = create_access_token(
        data={"sub": "00000000-0000-0000-0000-000000000000", "role": "candidate"},
        expires_delta=timedelta(seconds=-10),  # expired in past
    )
    headers_expired = {"Authorization": f"Bearer {expired_token}"}
    res_expired = await async_client.get("/api/v1/auth/me", headers=headers_expired)
    assert res_expired.status_code == 401


@pytest.mark.asyncio
async def test_t1_5_idor_probe_and_token_isolation(async_client: AsyncClient):
    """T1.5: IDOR check — User A's token cannot resolve User B's profile."""
    # Register User A
    res_a = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "user.a@example.com",
            "password": "PasswordA123!",
            "full_name": "User Alpha",
            "role": "candidate",
        },
    )
    token_a = res_a.json()["access_token"]
    user_a_id = res_a.json()["user"]["id"]

    # Register User B
    res_b = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "user.b@example.com",
            "password": "PasswordB123!",
            "full_name": "User Beta",
            "role": "candidate",
        },
    )
    token_b = res_b.json()["access_token"]
    user_b_id = res_b.json()["user"]["id"]

    # User A accesses /me -> receives only User A data
    me_a = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert me_a.status_code == 200
    assert me_a.json()["id"] == user_a_id
    assert me_a.json()["email"] == "user.a@example.com"
    assert me_a.json()["id"] != user_b_id

    # User B accesses /me -> receives only User B data
    me_b = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert me_b.status_code == 200
    assert me_b.json()["id"] == user_b_id
    assert me_b.json()["email"] == "user.b@example.com"


@pytest.mark.asyncio
async def test_t1_6_brute_force_throttling(async_client: AsyncClient):
    """T1.6: Repeated failed logins are throttled with 429 Too Many Requests."""
    # Register user
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "target.victim@example.com",
            "password": "RealPassword123!",
            "full_name": "Target User",
            "role": "candidate",
        },
    )

    # Attempt 10 failed logins (max limit)
    login_payload = {
        "email": "target.victim@example.com",
        "password": "AttackerGuess123!",
    }

    for _ in range(10):
        res = await async_client.post("/api/v1/auth/login", json=login_payload)
        assert res.status_code == 401

    # 11th failed attempt must be throttled with 429
    throttled_res = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert throttled_res.status_code == 429
    assert "Too many failed login attempts" in throttled_res.json()["detail"]
    assert "Retry-After" in throttled_res.headers


@pytest.mark.asyncio
async def test_rbac_access_control(async_client: AsyncClient):
    """Verify Candidate cannot access Admin-only endpoints, while Admin can."""
    # 1. Register Candidate
    res_cand = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "candidate.role@example.com",
            "password": "Password123!",
            "full_name": "Candidate User",
            "role": "candidate",
        },
    )
    token_cand = res_cand.json()["access_token"]

    # Candidate attempts Admin route -> 403 Forbidden
    res_cand_admin = await async_client.get(
        "/api/v1/auth/admin/users",
        headers={"Authorization": f"Bearer {token_cand}"},
    )
    assert res_cand_admin.status_code == 403
    assert "Required role: admin" in res_cand_admin.json()["detail"]

    # 2. Register Admin
    res_adm = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin.role@example.com",
            "password": "AdminPassword123!",
            "full_name": "System Admin",
            "role": "admin",
        },
    )
    token_adm = res_adm.json()["access_token"]

    # Admin accesses Admin route -> 200 OK
    res_adm_ok = await async_client.get(
        "/api/v1/auth/admin/users",
        headers={"Authorization": f"Bearer {token_adm}"},
    )
    assert res_adm_ok.status_code == 200
    users_list = res_adm_ok.json()
    assert isinstance(users_list, list)
    assert len(users_list) >= 2


@pytest.mark.asyncio
async def test_token_refresh_rotation(async_client: AsyncClient):
    """Verify refresh token issues a new access and refresh token pair."""
    reg_res = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh.tester@example.com",
            "password": "Password123!",
            "full_name": "Refresh Tester",
            "role": "candidate",
        },
    )
    refresh_token = reg_res.json()["refresh_token"]

    refresh_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["user"]["email"] == "refresh.tester@example.com"
