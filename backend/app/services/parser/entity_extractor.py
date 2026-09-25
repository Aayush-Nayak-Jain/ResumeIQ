"""Entity and Structured Information Extraction Engine (Module 4).

Extracts normalized candidate profile entities:
- Contact information (Name, Email, Phone, Social/Portfolio links, Location)
- Professional Summary
- Work Experience (Company, Title, Dates, Bullets, Technologies)
- Education (Institution, Degree, Dates, GPA)
- Skills (Categorized into technical, soft, domain, tool)
- Projects and Certifications
"""

import re
import uuid
from typing import Any

from app.schemas.parser import (
    ParsedCertification,
    ParsedContactInfo,
    ParsedEducation,
    ParsedProject,
    ParsedResumeStructuredData,
    ParsedSkill,
    ParsedWorkExperience,
)

# Common technical skill dictionary for high-precision extraction
KNOWN_SKILLS: dict[str, tuple[str, str]] = {
    # Programming Languages (technical)
    "python": ("Python", "technical"),
    "javascript": ("JavaScript", "technical"),
    "typescript": ("TypeScript", "technical"),
    "java": ("Java", "technical"),
    "c++": ("C++", "technical"),
    "c#": ("C#", "technical"),
    "go": ("Go", "technical"),
    "rust": ("Rust", "technical"),
    "php": ("PHP", "technical"),
    "ruby": ("Ruby", "technical"),
    "swift": ("Swift", "technical"),
    "kotlin": ("Kotlin", "technical"),
    "sql": ("SQL", "technical"),
    "html": ("HTML", "technical"),
    "css": ("CSS", "technical"),
    "r": ("R", "technical"),
    # Frameworks & Libraries (technical)
    "fastapi": ("FastAPI", "technical"),
    "react": ("React", "technical"),
    "next.js": ("Next.js", "technical"),
    "nextjs": ("Next.js", "technical"),
    "node.js": ("Node.js", "technical"),
    "nodejs": ("Node.js", "technical"),
    "express": ("Express", "technical"),
    "django": ("Django", "technical"),
    "flask": ("Flask", "technical"),
    "spring": ("Spring", "technical"),
    "spring boot": ("Spring Boot", "technical"),
    "vue": ("Vue.js", "technical"),
    "vue.js": ("Vue.js", "technical"),
    "angular": ("Angular", "technical"),
    "tailwind": ("Tailwind CSS", "technical"),
    "tailwind css": ("Tailwind CSS", "technical"),
    "bootstrap": ("Bootstrap", "technical"),
    "pytorch": ("PyTorch", "technical"),
    "tensorflow": ("TensorFlow", "technical"),
    "scikit-learn": ("Scikit-Learn", "technical"),
    "pandas": ("Pandas", "technical"),
    "numpy": ("NumPy", "technical"),
    # Databases & Storage (technical)
    "postgresql": ("PostgreSQL", "technical"),
    "postgres": ("PostgreSQL", "technical"),
    "mysql": ("MySQL", "technical"),
    "mongodb": ("MongoDB", "technical"),
    "redis": ("Redis", "technical"),
    "sqlite": ("SQLite", "technical"),
    "elasticsearch": ("Elasticsearch", "technical"),
    "cassandra": ("Cassandra", "technical"),
    "pgvector": ("pgvector", "domain"),
    # Cloud & DevOps (tool)
    "docker": ("Docker", "tool"),
    "kubernetes": ("Kubernetes", "tool"),
    "git": ("Git", "tool"),
    "github": ("GitHub", "tool"),
    "gitlab": ("GitLab", "tool"),
    "aws": ("AWS", "tool"),
    "azure": ("Azure", "tool"),
    "gcp": ("Google Cloud", "tool"),
    "google cloud": ("Google Cloud", "tool"),
    "terraform": ("Terraform", "tool"),
    "ci/cd": ("CI/CD", "tool"),
    "linux": ("Linux", "tool"),
    "nginx": ("Nginx", "tool"),
    "postman": ("Postman", "tool"),
    # Domains & Methodologies (domain)
    "machine learning": ("Machine Learning", "domain"),
    "deep learning": ("Deep Learning", "domain"),
    "natural language processing": ("NLP", "domain"),
    "nlp": ("NLP", "domain"),
    "rest api": ("REST APIs", "domain"),
    "rest apis": ("REST APIs", "domain"),
    "graphql": ("GraphQL", "domain"),
    "microservices": ("Microservices", "domain"),
    "agile": ("Agile", "domain"),
    "scrum": ("Scrum", "domain"),
    "prompt engineering": ("Prompt Engineering", "domain"),
    "generative ai": ("Generative AI", "domain"),
    "rag": ("RAG", "domain"),
    # Soft Skills (soft)
    "leadership": ("Leadership", "soft"),
    "communication": ("Communication", "soft"),
    "collaboration": ("Collaboration", "soft"),
    "problem solving": ("Problem Solving", "soft"),
    "mentoring": ("Mentoring", "soft"),
    "time management": ("Time Management", "soft"),
}

# Regex patterns for contact data
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")
LINKEDIN_REGEX = re.compile(r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+", re.IGNORECASE)
GITHUB_REGEX = re.compile(r"(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+", re.IGNORECASE)
URL_REGEX = re.compile(r"https?:\/\/[^\s]+", re.IGNORECASE)

# Date patterns (e.g. '2020 - 2022', 'June 2021 - Present', '05/2019 - 08/2021')
DATE_RANGE_REGEX = re.compile(
    r"((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}/\d{2,4}|\d{4})\s*[-–—to]+\s*(?:Present|Current|Ongoing|\d{1,2}/\d{2,4}|\d{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}))",
    re.IGNORECASE,
)

DEGREE_KEYWORDS = [
    "bachelor",
    "master",
    "ph.d",
    "doctor",
    "b.s",
    "b.tech",
    "m.s",
    "m.tech",
    "bca",
    "mca",
    "b.a",
    "m.a",
    "b.e",
    "m.e",
    "associate",
    "diploma",
]


class EntityExtractor:
    """Extracts entities and maps them into structured resume models."""

    @classmethod
    def extract_structured_data(
        cls,
        sections: dict[str, str],
        raw_text: str,
    ) -> ParsedResumeStructuredData:
        """Parses all sections into standard ParsedResumeStructuredData object."""
        contact_info = cls.extract_contact_info(sections.get("header", ""), raw_text)
        summary = cls.extract_summary(sections.get("summary", ""), raw_text)
        experience = cls.extract_experience(sections.get("experience", ""))
        education = cls.extract_education(sections.get("education", ""))
        skills = cls.extract_skills(sections.get("skills", ""), raw_text)
        projects = cls.extract_projects(sections.get("projects", ""))
        certifications = cls.extract_certifications(sections.get("certifications", ""))

        return ParsedResumeStructuredData(
            personal_info=contact_info,
            summary=summary,
            experience=experience,
            education=education,
            skills=skills,
            projects=projects,
            certifications=certifications,
        )

    @classmethod
    def extract_contact_info(cls, header_text: str, raw_text: str) -> ParsedContactInfo:
        """Extracts candidate personal details, email, phone, location, and links."""
        search_scope = header_text if len(header_text.strip()) > 20 else raw_text[:1000]

        # 1. Email
        email_match = EMAIL_REGEX.search(search_scope) or EMAIL_REGEX.search(raw_text)
        email = email_match.group(0).strip().rstrip(".,") if email_match else ""

        # 2. Phone
        phone_match = PHONE_REGEX.search(search_scope)
        phone = phone_match.group(0).strip() if phone_match else ""
        if phone and len(re.sub(r"\D", "", phone)) < 7:
            phone = ""  # Discard spurious short number sequences

        # 3. Social / Portfolio links
        linkedin_match = LINKEDIN_REGEX.search(raw_text)
        linkedin_url = linkedin_match.group(0).strip() if linkedin_match else ""

        github_match = GITHUB_REGEX.search(raw_text)
        github_url = github_match.group(0).strip() if github_match else ""

        portfolio_url = ""
        for match in URL_REGEX.finditer(search_scope):
            url = match.group(0).strip()
            if "linkedin.com" not in url and "github.com" not in url:
                portfolio_url = url
                break

        # 4. Name extraction heuristic:
        # The candidate's name is almost always the first non-empty line of the document header
        lines = [line.strip() for line in search_scope.split("\n") if line.strip()]
        full_name = ""
        location = ""

        for line in lines[:4]:
            if line == email or line == phone or line in (linkedin_url, github_url, portfolio_url):
                continue
            if "@" in line or "http" in line or "www." in line:
                continue
            # Location heuristic (e.g. 'Seattle, WA' or 'San Francisco, CA')
            if re.search(r"[A-Za-z\s]+,\s*[A-Za-z]{2,}", line) and not full_name:
                continue
            elif re.search(r"[A-Za-z\s]+,\s*[A-Za-z]{2,}", line):
                location = line.strip()
                continue

            # Candidate name should contain alphabetic characters, 2-4 words, < 40 chars
            clean_candidate = re.sub(r"[^A-Za-z\s\.\-]", "", line).strip()
            words = clean_candidate.split()
            if 1 <= len(words) <= 4 and len(clean_candidate) < 40 and not full_name:
                full_name = clean_candidate

        return ParsedContactInfo(
            full_name=full_name,
            email=email,
            phone=phone,
            location=location,
            linkedin_url=linkedin_url,
            github_url=github_url,
            portfolio_url=portfolio_url,
        )

    @classmethod
    def extract_summary(cls, summary_text: str, raw_text: str) -> str:
        """Returns normalized executive summary text."""
        if summary_text.strip():
            return summary_text.strip()
        return ""

    @classmethod
    def extract_experience(cls, exp_text: str) -> list[ParsedWorkExperience]:
        """Parses experience block into distinct positions with bullets and dates."""
        if not exp_text.strip():
            return []

        entries: list[ParsedWorkExperience] = []
        lines = [line.strip() for line in exp_text.split("\n") if line.strip()]

        current_entry: dict[str, Any] | None = None

        for line in lines:
            date_match = DATE_RANGE_REGEX.search(line)
            # A line containing a date range is typically a role/company header
            if date_match and len(line) < 120:
                if current_entry:
                    entries.append(cls._finalize_experience(current_entry))

                date_str = date_match.group(1).strip()
                # Line without the date represents title and/or company
                remaining = line.replace(date_str, "").strip(" -–|,\t")
                parts = [p.strip() for p in re.split(r"[|–—\-,]\s*", remaining) if p.strip()]

                company = parts[0] if len(parts) > 0 else "Company"
                title = parts[1] if len(parts) > 1 else (parts[0] if len(parts) > 0 else "Software Engineer")

                current_entry = {
                    "company": company,
                    "title": title,
                    "start_date": date_str.split("-")[0].strip() if "-" in date_str else date_str,
                    "end_date": date_str.split("-")[1].strip() if "-" in date_str else "Present",
                    "is_current": "present" in date_str.lower() or "current" in date_str.lower(),
                    "bullets": [],
                    "technologies": [],
                }
            elif current_entry:
                # Bullet or detail line
                cleaned_bullet = re.sub(r"^[•\-*>\s]+", "", line).strip()
                if cleaned_bullet:
                    current_entry["bullets"].append(cleaned_bullet)
                    # Extract technologies mentioned in the bullet
                    techs = cls._extract_tech_keywords(cleaned_bullet)
                    for t in techs:
                        if t not in current_entry["technologies"]:
                            current_entry["technologies"].append(t)
            else:
                # First non-dated line before bullets
                if not current_entry:
                    current_entry = {
                        "company": line,
                        "title": "Software Engineer",
                        "start_date": "",
                        "end_date": "",
                        "is_current": False,
                        "bullets": [],
                        "technologies": [],
                    }

        if current_entry:
            entries.append(cls._finalize_experience(current_entry))

        return entries

    @classmethod
    def _finalize_experience(cls, entry_dict: dict[str, Any]) -> ParsedWorkExperience:
        """Converts raw experience dictionary to ParsedWorkExperience schema."""
        return ParsedWorkExperience(
            id=str(uuid.uuid4()),
            company=entry_dict.get("company", ""),
            title=entry_dict.get("title", ""),
            location=entry_dict.get("location", ""),
            start_date=entry_dict.get("start_date", ""),
            end_date=entry_dict.get("end_date", ""),
            is_current=entry_dict.get("is_current", False),
            bullets=entry_dict.get("bullets", []),
            technologies=entry_dict.get("technologies", []),
        )

    @classmethod
    def extract_education(cls, edu_text: str) -> list[ParsedEducation]:
        """Parses education block into institution, degree, and graduation dates."""
        if not edu_text.strip():
            return []

        entries: list[ParsedEducation] = []
        lines = [line.strip() for line in edu_text.split("\n") if line.strip()]

        current_edu: dict[str, Any] | None = None

        for line in lines:
            # Check for degree keywords
            has_degree = any(kw in line.lower() for kw in DEGREE_KEYWORDS)
            date_match = DATE_RANGE_REGEX.search(line) or re.search(r"\b(19\d\d|20\d\d)\b", line)

            # Check for grade / GPA
            grade_match = re.search(
                r"(?:CGPA|GPA|Grade)[:\s]*([0-9\.]+(?:\s*/\s*[0-9\.]+)?(?:\s*%?)?)",
                line,
                re.IGNORECASE,
            )
            grade = grade_match.group(1).strip() if grade_match else ""

            if has_degree or date_match:
                if current_edu and (current_edu["degree"] or current_edu["institution"]):
                    entries.append(cls._finalize_education(current_edu))
                    current_edu = None

                dates = date_match.group(0) if date_match else ""
                deg = line if has_degree else ""

                current_edu = {
                    "institution": line if not has_degree else "",
                    "degree": deg,
                    "field_of_study": "",
                    "start_date": dates.split("-")[0].strip() if "-" in dates else dates,
                    "end_date": dates.split("-")[1].strip() if "-" in dates else dates,
                    "grade": grade,
                }
            elif current_edu:
                if not current_edu["institution"] and not has_degree:
                    current_edu["institution"] = line
                elif not current_edu["degree"] and has_degree:
                    current_edu["degree"] = line
                elif grade and not current_edu["grade"]:
                    current_edu["grade"] = grade

        if current_edu:
            entries.append(cls._finalize_education(current_edu))

        return entries

    @classmethod
    def _finalize_education(cls, edu_dict: dict[str, Any]) -> ParsedEducation:
        return ParsedEducation(
            id=str(uuid.uuid4()),
            institution=edu_dict.get("institution") or "University",
            degree=edu_dict.get("degree") or "Degree",
            field_of_study=edu_dict.get("field_of_study", ""),
            start_date=edu_dict.get("start_date", ""),
            end_date=edu_dict.get("end_date", ""),
            grade=edu_dict.get("grade", ""),
        )

    @classmethod
    def extract_skills(cls, skills_text: str, full_text: str) -> list[ParsedSkill]:
        """Extracts skills matching known taxonomy from the skills section and document."""
        found_skills: dict[str, ParsedSkill] = {}

        # 1. First pass: explicit skills section (high confidence)
        target_scope = skills_text.lower() if skills_text.strip() else full_text.lower()

        # Split on commas, bullets, pipes, or semicolons
        tokens = re.split(r"[,;•|\n/]+", target_scope)
        for token in tokens:
            cleaned = token.strip().lower()
            if cleaned in KNOWN_SKILLS:
                canonical_name, category = KNOWN_SKILLS[cleaned]
                found_skills[canonical_name] = ParsedSkill(
                    name=canonical_name,
                    category=category,  # type: ignore
                    proficiency="intermediate",
                )

        # 2. Keyword scanning for multi-word or compound skills in full text
        for key, (canonical_name, category) in KNOWN_SKILLS.items():
            if canonical_name in found_skills:
                continue
            # Word boundary regex search
            escaped = re.escape(key)
            if re.search(rf"\b{escaped}\b", target_scope):
                found_skills[canonical_name] = ParsedSkill(
                    name=canonical_name,
                    category=category,  # type: ignore
                    proficiency="intermediate",
                )

        # If skills section had items not in dictionary, preserve them as technical
        if skills_text.strip():
            raw_tokens = [t.strip() for t in re.split(r"[,;•|\n]+", skills_text) if t.strip()]
            for tok in raw_tokens:
                if len(tok) > 2 and len(tok) < 30 and tok not in found_skills:
                    # Avoid adding headings as skills
                    if tok.lower() not in ("skills", "technical skills", "tools", "languages"):
                        found_skills[tok] = ParsedSkill(
                            name=tok,
                            category="technical",
                            proficiency="intermediate",
                        )

        return list(found_skills.values())

    @classmethod
    def extract_projects(cls, proj_text: str) -> list[ParsedProject]:
        """Parses project titles, tech stacks, and descriptions."""
        if not proj_text.strip():
            return []

        projects: list[ParsedProject] = []
        lines = [line.strip() for line in proj_text.split("\n") if line.strip()]

        current_proj: dict[str, Any] | None = None

        for line in lines:
            # Bullet point or detail
            if line.startswith(("-", "*", "•")):
                if current_proj:
                    bullet = re.sub(r"^[•\-*>\s]+", "", line).strip()
                    current_proj["bullets"].append(bullet)
                    techs = cls._extract_tech_keywords(bullet)
                    for t in techs:
                        if t not in current_proj["technologies"]:
                            current_proj["technologies"].append(t)
            else:
                # New project title candidate
                if current_proj:
                    projects.append(cls._finalize_project(current_proj))

                parts = line.split("|")
                title = parts[0].strip()
                techs = [p.strip() for p in parts[1].split(",")] if len(parts) > 1 else []

                current_proj = {
                    "title": title,
                    "description": "",
                    "technologies": techs,
                    "bullets": [],
                }

        if current_proj:
            projects.append(cls._finalize_project(current_proj))

        return projects

    @classmethod
    def _finalize_project(cls, p: dict[str, Any]) -> ParsedProject:
        desc = " ".join(p["bullets"]) if p["bullets"] else p["description"]
        return ParsedProject(
            id=str(uuid.uuid4()),
            title=p.get("title") or "Project",
            description=desc,
            technologies=p.get("technologies", []),
            bullets=p.get("bullets", []),
        )

    @classmethod
    def extract_certifications(cls, cert_text: str) -> list[ParsedCertification]:
        """Parses certification names and issuers."""
        if not cert_text.strip():
            return []

        certifications: list[ParsedCertification] = []
        lines = [line.strip() for line in cert_text.split("\n") if line.strip()]

        for line in lines:
            cleaned = re.sub(r"^[•\-*>\s]+", "", line).strip()
            if not cleaned or len(cleaned) < 3:
                continue

            parts = [p.strip() for p in re.split(r"[|\-,]\s*", cleaned) if p.strip()]
            name = parts[0] if parts else cleaned
            issuer = parts[1] if len(parts) > 1 else "Professional"

            certifications.append(
                ParsedCertification(
                    id=str(uuid.uuid4()),
                    name=name,
                    issuer=issuer,
                )
            )

        return certifications

    @staticmethod
    def _extract_tech_keywords(text: str) -> list[str]:
        """Extracts known tech stack mentions from text."""
        lowered = text.lower()
        found = []
        for key, (canonical, _) in KNOWN_SKILLS.items():
            if re.search(rf"\b{re.escape(key)}\b", lowered):
                if canonical not in found:
                    found.append(canonical)
        return found
