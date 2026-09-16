"""Unit and Authorization Tests for Resume Management (Module 3)."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_get_resume(async_client: AsyncClient):
    """User can create a resume document and fetch it with version 1 initialized."""
    # Register candidate
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "resume.builder@example.com",
            "password": "Password123!",
            "full_name": "Taylor Swiftly",
            "role": "candidate",
        },
    )
    token = reg.json()["access_token"]

    create_payload = {
        "title": "Master Backend Resume",
        "target_role": "Senior Python Engineer",
        "is_master": True,
        "structured_data": {
            "personal_info": {
                "full_name": "Taylor Swiftly",
                "email": "resume.builder@example.com",
                "phone": "+1-555-4321",
                "location": "Austin, TX",
            },
            "summary": "Full-stack engineer specialized in high-performance APIs.",
            "skills": [
                {"name": "Python", "category": "technical", "proficiency": "expert"},
                {"name": "FastAPI", "category": "technical", "proficiency": "expert"},
                {"name": "PostgreSQL", "category": "technical", "proficiency": "expert"},
                {"name": "Docker", "category": "tool", "proficiency": "intermediate"},
                {"name": "Redis", "category": "tool", "proficiency": "intermediate"},
            ],
            "experience": [
                {
                    "company": "FastScale LLC",
                    "title": "Senior API Architect",
                    "start_date": "2022-01",
                    "end_date": "Present",
                    "bullets": [
                        "Architected event-driven architecture reducing message latency by 45%.",
                        "Implemented strict JWT auth and rate limiting across 20+ microservices.",
                    ],
                }
            ],
            "education": [
                {
                    "institution": "University of Texas at Austin",
                    "degree": "B.S. in Computer Science",
                    "start_date": "2017",
                    "end_date": "2021",
                }
            ],
        },
    }

    # 1. Create Resume
    create_res = await async_client.post(
        "/api/v1/resumes",
        headers={"Authorization": f"Bearer {token}"},
        json=create_payload,
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["title"] == "Master Backend Resume"
    assert created_data["version_number"] == 1
    assert created_data["is_master"] is True
    assert created_data["completeness_score"] >= 70
    resume_id = created_data["id"]

    # 2. Get Resume Details
    get_res = await async_client.get(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == resume_id
    assert get_res.json()["title"] == "Master Backend Resume"


@pytest.mark.asyncio
async def test_update_resume_increments_version(async_client: AsyncClient):
    """Updating resume structured data increments version number from 1 to 2."""
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "version.test@example.com",
            "password": "Password123!",
            "full_name": "Version Tester",
            "role": "candidate",
        },
    )
    token = reg.json()["access_token"]

    create_res = await async_client.post(
        "/api/v1/resumes",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Draft Resume", "structured_data": {"summary": "Initial draft."}},
    )
    resume_id = create_res.json()["id"]
    assert create_res.json()["version_number"] == 1

    # Update structured data
    update_res = await async_client.put(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Polished Resume",
            "structured_data": {
                "summary": "Updated comprehensive professional summary.",
                "skills": [{"name": "Python"}],
            },
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["title"] == "Polished Resume"
    assert updated["version_number"] == 2


@pytest.mark.asyncio
async def test_resume_idor_defense(async_client: AsyncClient):
    """User A cannot view, update, or delete User B's resume document."""
    # User A creates a resume
    res_a = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "owner.user@example.com",
            "password": "Password123!",
            "full_name": "Owner User",
            "role": "candidate",
        },
    )
    token_a = res_a.json()["access_token"]
    create_a = await async_client.post(
        "/api/v1/resumes",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"title": "Confidential Executive Resume"},
    )
    resume_a_id = create_a.json()["id"]

    # User B registers
    res_b = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "intruder.user@example.com",
            "password": "Password123!",
            "full_name": "Intruder User",
            "role": "candidate",
        },
    )
    token_b = res_b.json()["access_token"]

    # User B attempts to GET User A's resume -> 404 (IDOR prevented)
    probe_get = await async_client.get(
        f"/api/v1/resumes/{resume_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert probe_get.status_code == 404

    # User B attempts to UPDATE User A's resume -> 404
    probe_put = await async_client.put(
        f"/api/v1/resumes/{resume_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"title": "Hacked Title"},
    )
    assert probe_put.status_code == 404

    # User B attempts to DELETE User A's resume -> 404
    probe_del = await async_client.delete(
        f"/api/v1/resumes/{resume_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert probe_del.status_code == 404


@pytest.mark.asyncio
async def test_delete_resume(async_client: AsyncClient):
    """Candidate can delete their own resume, confirming 204 status and subsequent 404."""
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "delete.test@example.com",
            "password": "Password123!",
            "full_name": "Delete Tester",
            "role": "candidate",
        },
    )
    token = reg.json()["access_token"]

    create_res = await async_client.post(
        "/api/v1/resumes",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Temporary Resume"},
    )
    resume_id = create_res.json()["id"]

    # Delete resume
    del_res = await async_client.delete(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_res.status_code == 204

    # Verify resume no longer exists
    get_res = await async_client.get(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_res.status_code == 404
