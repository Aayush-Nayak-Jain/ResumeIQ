"""Unit and Authorization Tests for Candidate Profile (Module 2)."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_my_profile_authenticated(async_client: AsyncClient):
    """Candidate can retrieve their auto-initialized master profile."""
    # Register candidate
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile.test@example.com",
            "password": "Password123!",
            "full_name": "Jordan Lee",
            "role": "candidate",
        },
    )
    token = reg.json()["access_token"]
    user_id = reg.json()["user"]["id"]

    # Fetch profile
    res = await async_client.get(
        "/api/v1/profile/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["user_id"] == user_id
    assert "profile_strength" in data
    assert isinstance(data["skills"], list)
    assert isinstance(data["experience"], list)


@pytest.mark.asyncio
async def test_update_my_profile_facts(async_client: AsyncClient):
    """Candidate can update headline, summary, skills, experience, and contact info."""
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "update.profile@example.com",
            "password": "Password123!",
            "full_name": "Morgan Davis",
            "role": "candidate",
        },
    )
    token = reg.json()["access_token"]

    update_payload = {
        "headline": "Senior Backend & Cloud Architect",
        "summary": (
            "Experienced software engineer with 6+ years building "
            "resilient distributed cloud systems."
        ),
        "contact_info": {
            "phone": "+1-555-0199",
            "location": "San Francisco, CA",
            "linkedin_url": "https://linkedin.com/in/morgandavis",
            "github_url": "https://github.com/morgandavis",
        },
        "skills": [
            {"name": "Python", "category": "technical", "proficiency": "expert"},
            {"name": "FastAPI", "category": "technical", "proficiency": "expert"},
            {"name": "PostgreSQL", "category": "technical", "proficiency": "intermediate"},
        ],
        "experience": [
            {
                "company": "CloudScale Systems",
                "title": "Lead Backend Engineer",
                "location": "San Francisco, CA",
                "start_date": "2021-03",
                "end_date": "Present",
                "is_current": True,
                "bullets": [
                    "Engineered microservices processing 10M requests with low latency.",
                    "Migrated database clusters to PostgreSQL with zero-downtime replication.",
                ],
                "technologies": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            }
        ],
        "education": [
            {
                "institution": "University of California, Berkeley",
                "degree": "B.S. in Computer Science",
                "field_of_study": "Computer Science",
                "start_date": "2016",
                "end_date": "2020",
                "grade": "3.85 CGPA",
            }
        ],
    }

    res = await async_client.put(
        "/api/v1/profile/me",
        headers={"Authorization": f"Bearer {token}"},
        json=update_payload,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["headline"] == "Senior Backend & Cloud Architect"
    assert len(data["skills"]) == 3
    assert len(data["experience"]) == 1
    assert data["contact_info"]["location"] == "San Francisco, CA"
    # Strength should now be significantly higher than empty profile
    assert data["profile_strength"] >= 70


@pytest.mark.asyncio
async def test_profile_idor_isolation(async_client: AsyncClient):
    """User A cannot access or overwrite User B's profile."""
    # User A
    res_a = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "user.one@example.com",
            "password": "Password123!",
            "full_name": "User One",
            "role": "candidate",
        },
    )
    token_a = res_a.json()["access_token"]
    await async_client.put(
        "/api/v1/profile/me",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"headline": "Headline for User One"},
    )

    # User B
    res_b = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "user.two@example.com",
            "password": "Password123!",
            "full_name": "User Two",
            "role": "candidate",
        },
    )
    token_b = res_b.json()["access_token"]

    # User B gets own profile -> does NOT see User A's headline
    get_b = await async_client.get(
        "/api/v1/profile/me",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert get_b.status_code == 200
    assert get_b.json()["headline"] != "Headline for User One"
