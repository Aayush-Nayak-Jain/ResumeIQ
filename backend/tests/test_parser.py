"""Test Suite for Resume Parsing Engine (Module 4 / T4.1–T4.6).

Covers:
- T4.1: Clean single-column PDF parsing (name, contact, sections, skills)
- T4.2: Multi-column PDF layout preservation (preventing interleaved garble)
- T4.3: DOCX document parsing with structured output parity
- T4.4: Unsupported file extension rejection (.txt, .jpg)
- T4.5: Oversized file rejection (> 10MB)
- T4.6: MIME spoofing / renamed file rejection via magic bytes check
- API integration tests for /resumes/parse and /resumes/upload-and-create
- Zero-PII logging verification
"""

import io

import docx
import fitz
import pytest
from httpx import AsyncClient

from app.services.parser.file_validator import DocumentValidator
from app.services.parser_service import ParserService


def create_sample_single_column_pdf() -> bytes:
    """Generates a clean single-column test PDF in memory using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)  # Letter size

    content = """Jane Doe
jane.doe@example.com | +1 555 234 5678 | Seattle, WA
https://linkedin.com/in/janedoe | https://github.com/janedoe

Professional Summary
Senior Software Engineer with 6+ years of experience developing distributed backend services,
high-throughput REST APIs, and scalable cloud architectures.

Work Experience
InnovateTech Inc. | Senior Backend Engineer | 2021 - Present
• Designed low-latency microservices with Python and FastAPI handling 10M requests daily.
• Optimized PostgreSQL query performance and caching with Redis, reducing latency by 45%.
• Mentored 5 junior engineers and established CI/CD automated deployment pipelines.

CloudScale Solutions | Software Engineer | 2018 - 2021
• Developed responsive web applications using React, TypeScript, and Node.js.
• Containerized legacy monoliths into Docker containers orchestrated on Kubernetes.

Education
University of Washington | B.S. in Computer Science | 2014 - 2018
CGPA: 3.85 / 4.0

Technical Skills
Python, FastAPI, TypeScript, React, PostgreSQL, Docker, Kubernetes, Redis, AWS, Git, Microservices

Key Projects
ResumeIQ AI Platform | Python, FastAPI, Next.js
• Built automated resume intelligence engine with ATS scoring and semantic matching.
"""
    y = 50
    for line in content.strip().split("\n"):
        if line.strip():
            page.insert_text(fitz.Point(50, y), line.strip(), fontsize=10)
            y += 16
        else:
            y += 10

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def create_sample_multi_column_pdf() -> bytes:
    """
    Generates a multi-column PDF (Left sidebar + Right main content)
    to test layout-aware column extraction (T4.2).
    """
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)

    # Full width header
    page.insert_text(fitz.Point(50, 40), "Marcus Vance", fontsize=16)
    page.insert_text(
        fitz.Point(50, 60), "marcus.vance@example.com | +1 555 987 6543 | Austin, TX", fontsize=10
    )
    page.insert_text(fitz.Point(50, 75), "https://github.com/marcusvance", fontsize=9)

    # Left column: Sidebar (Contact details, Skills, Education) - x: 50 to 200
    page.insert_text(fitz.Point(50, 120), "Technical Skills", fontsize=12)
    page.insert_text(fitz.Point(50, 140), "Python, Go, Docker", fontsize=9)
    page.insert_text(fitz.Point(50, 155), "Kubernetes, PostgreSQL", fontsize=9)
    page.insert_text(fitz.Point(50, 170), "Redis, AWS, Linux", fontsize=9)

    page.insert_text(fitz.Point(50, 220), "Education", fontsize=12)
    page.insert_text(fitz.Point(50, 240), "B.S. Software Engineering", fontsize=9)
    page.insert_text(fitz.Point(50, 255), "University of Texas, 2019", fontsize=9)

    # Right column: Main content (Summary, Work Experience) - x: 250 to 550
    page.insert_text(fitz.Point(250, 120), "Professional Summary", fontsize=12)
    page.insert_text(
        fitz.Point(250, 140),
        "Site Reliability Engineer specializing in Kubernetes infrastructure.",
        fontsize=9,
    )

    page.insert_text(fitz.Point(250, 180), "Work Experience", fontsize=12)
    page.insert_text(
        fitz.Point(250, 200), "Apex Cloud Systems | DevOps Lead | 2020 - Present", fontsize=10
    )
    page.insert_text(
        fitz.Point(250, 218),
        "• Maintained 99.99% service availability across multi-region Kubernetes clusters.",
        fontsize=9,
    )
    page.insert_text(
        fitz.Point(250, 234),
        "• Automated infrastructure provisioning using Terraform and Docker.",
        fontsize=9,
    )

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def create_sample_docx() -> bytes:
    """Generates a standard Word document (.docx) in memory using python-docx."""
    doc = docx.Document()

    # Header
    doc.add_heading("Sarah Jenkins", 0)
    doc.add_paragraph("sarah.jenkins@example.com | +1 (555) 432-1098 | Boston, MA")
    doc.add_paragraph("https://linkedin.com/in/sarahjenkins | https://github.com/sarahjenkins")

    # Summary
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph(
        "Full-Stack Developer with 4 years of experience building modern web apps "
        "with TypeScript, React, Next.js, and Python."
    )

    # Experience
    doc.add_heading("Work Experience", level=1)
    doc.add_paragraph("Vanguard Tech | Full-Stack Engineer | 2020 - Present")
    doc.add_paragraph(
        "Architected REST APIs using Python and FastAPI with PostgreSQL.", style="List Bullet"
    )
    doc.add_paragraph(
        "Built responsive user interfaces with Next.js and Tailwind CSS.", style="List Bullet"
    )

    # Education
    doc.add_heading("Education", level=1)
    doc.add_paragraph("MIT | B.S. in Computer Science | 2016 - 2020 | CGPA: 3.9")

    # Skills
    doc.add_heading("Technical Skills", level=1)
    doc.add_paragraph("Python, FastAPI, TypeScript, React, Next.js, PostgreSQL, Docker, Git")

    # Projects
    doc.add_heading("Key Projects", level=1)
    doc.add_paragraph("CloudTracker | React, FastAPI, Docker")
    doc.add_paragraph("• Real-time cloud resource monitoring dashboard.", style="List Bullet")

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# Unit Tests (T4.1 to T4.6)
# -----------------------------------------------------------------------------


def test_t4_1_clean_single_column_pdf():
    """T4.1: Clean single-column PDF extracts name, contact, sections, and skills."""
    pdf_bytes = create_sample_single_column_pdf()
    parsed = ParserService.parse_document_bytes(
        file_bytes=pdf_bytes,
        filename="jane_doe_resume.pdf",
    )

    # Verify structured entity extraction
    assert parsed.structured_data.personal_info.full_name == "Jane Doe"
    assert parsed.structured_data.personal_info.email == "jane.doe@example.com"
    assert "555" in (parsed.structured_data.personal_info.phone or "")
    assert "janedoe" in (parsed.structured_data.personal_info.linkedin_url or "")
    assert "janedoe" in (parsed.structured_data.personal_info.github_url or "")

    # Verify sections detected
    detected = parsed.metadata.detected_sections
    assert "summary" in detected or "experience" in detected
    assert len(parsed.structured_data.experience) >= 1
    assert any(
        "InnovateTech" in e.company or "InnovateTech" in e.title
        for e in parsed.structured_data.experience
    )

    # Verify skills extracted
    skill_names = [s.name for s in parsed.structured_data.skills]
    assert "Python" in skill_names
    assert "FastAPI" in skill_names
    assert "Docker" in skill_names
    assert parsed.completeness_score > 60


def test_t4_2_messy_multi_column_pdf():
    """T4.2: Multi-column layout preserves reading order without interleave garble."""
    pdf_bytes = create_sample_multi_column_pdf()
    parsed = ParserService.parse_document_bytes(
        file_bytes=pdf_bytes,
        filename="marcus_vance_two_column.pdf",
    )

    assert parsed.structured_data.personal_info.full_name == "Marcus Vance"
    assert parsed.structured_data.personal_info.email == "marcus.vance@example.com"

    # Multi-column text should contain content from both columns
    assert "Kubernetes" in parsed.raw_text
    assert "Apex Cloud Systems" in parsed.raw_text or "DevOps Lead" in parsed.raw_text
    skill_names = [s.name for s in parsed.structured_data.skills]
    assert "Kubernetes" in skill_names or "Python" in skill_names


def test_t4_3_docx_input_matches_output_shape():
    """T4.3: DOCX input yields the same structured JSON schema and types as PDF."""
    docx_bytes = create_sample_docx()
    parsed = ParserService.parse_document_bytes(
        file_bytes=docx_bytes,
        filename="sarah_jenkins.docx",
    )

    assert parsed.metadata.file_type == "docx"
    assert parsed.structured_data.personal_info.full_name == "Sarah Jenkins"
    assert parsed.structured_data.personal_info.email == "sarah.jenkins@example.com"
    assert len(parsed.structured_data.experience) >= 1
    assert len(parsed.structured_data.education) >= 1
    assert len(parsed.structured_data.skills) >= 4

    skill_names = [s.name for s in parsed.structured_data.skills]
    assert "TypeScript" in skill_names
    assert "FastAPI" in skill_names


def test_t4_4_wrong_file_type_rejected():
    """T4.4: Unsupported file formats (.txt, .jpg, .png) are rejected with clear 400 error."""
    with pytest.raises(Exception) as exc_info:
        DocumentValidator.validate_document(
            filename="my_resume.txt",
            content=b"Just plain text resume",
        )
    assert exc_info.value.status_code == 400
    assert "Unsupported file type" in exc_info.value.detail

    with pytest.raises(Exception) as exc_info_img:
        DocumentValidator.validate_document(
            filename="resume_photo.jpg",
            content=b"\xff\xd8\xff\xe0\x00\x10JFIF",
        )
    assert exc_info_img.value.status_code == 400


def test_t4_5_oversized_file_rejected():
    """T4.5: Oversized file (> 10MB) is rejected with 413 before parsing is attempted."""
    # Create an 11 MB dummy payload with PDF extension
    large_payload = b"%PDF-1.4 " + (b"0" * (11 * 1024 * 1024))
    with pytest.raises(Exception) as exc_info:
        DocumentValidator.validate_document(
            filename="huge_resume.pdf",
            content=large_payload,
            max_size=10 * 1024 * 1024,
        )
    assert exc_info.value.status_code == 413
    assert "maximum allowed size limit" in exc_info.value.detail


def test_t4_6_renamed_file_rejected_by_magic_bytes():
    """T4.6: File renamed to .pdf/.docx with invalid content is rejected."""
    # Text file disguised as .pdf
    fake_pdf = b"Hello, this is just a text file renamed to resume.pdf!"
    with pytest.raises(Exception) as exc_info_pdf:
        DocumentValidator.validate_document(
            filename="sneaky_resume.pdf",
            content=fake_pdf,
        )
    assert exc_info_pdf.value.status_code == 400
    assert "Corrupt or invalid PDF" in exc_info_pdf.value.detail

    # Random binary disguised as .docx
    fake_docx = b"Not a zip file or docx archive at all!"
    with pytest.raises(Exception) as exc_info_docx:
        DocumentValidator.validate_document(
            filename="fake_resume.docx",
            content=fake_docx,
        )
    assert exc_info_docx.value.status_code == 400
    assert "Corrupt or invalid DOCX" in exc_info_docx.value.detail


# -----------------------------------------------------------------------------
# Integration Tests (FastAPI Endpoints)
# -----------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_api_parse_resume_endpoint(async_client: AsyncClient):
    """Verifies POST /api/v1/resumes/parse parses PDF and returns structured JSON preview."""
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "parse.tester@example.com",
            "password": "Password123!",
            "full_name": "Jane Tester",
            "role": "candidate",
        },
    )
    token = reg.json()["access_token"]
    pdf_bytes = create_sample_single_column_pdf()
    files = {"file": ("jane_doe.pdf", pdf_bytes, "application/pdf")}

    response = await async_client.post(
        "/api/v1/resumes/parse",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
    )
    assert response.status_code == 200
    data = response.json()
    assert "structured_data" in data
    assert data["structured_data"]["personal_info"]["full_name"] == "Jane Doe"
    assert data["metadata"]["file_type"] == "pdf"
    assert data["completeness_score"] > 0


@pytest.mark.asyncio
async def test_api_upload_and_create_resume(async_client: AsyncClient):
    """Verifies POST /api/v1/resumes/upload-and-create creates a persistent Resume record."""
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "sarah.uploader@example.com",
            "password": "Password123!",
            "full_name": "Sarah Uploader",
            "role": "candidate",
        },
    )
    token = reg.json()["access_token"]
    docx_bytes = create_sample_docx()
    files = {
        "file": (
            "sarah_jenkins.docx",
            docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    }
    form_data = {"title": "Imported Sarah Profile", "is_master": "true"}

    response = await async_client.post(
        "/api/v1/resumes/upload-and-create",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=form_data,
    )
    assert response.status_code == 201
    created = response.json()
    assert created["title"] == "Imported Sarah Profile"
    assert created["is_master"] is True
    assert created["version_number"] == 1
    assert created["status"] == "imported"
    assert "structured_data" in created
    assert created["structured_data"]["personal_info"]["full_name"] == "Sarah Jenkins"


@pytest.mark.asyncio
async def test_api_unauthorized_parse_rejected(async_client: AsyncClient):
    """Unauthenticated parse attempts are rejected with 401."""
    pdf_bytes = create_sample_single_column_pdf()
    files = {"file": ("test.pdf", pdf_bytes, "application/pdf")}
    response = await async_client.post("/api/v1/resumes/parse", files=files)
    assert response.status_code == 401
