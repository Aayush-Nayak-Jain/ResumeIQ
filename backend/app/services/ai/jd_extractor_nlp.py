"""Deterministic NLP and Heuristic Engine for Job Description Entity & Requirement Extraction.

Provides high-speed, deterministic parsing of requirements, categorized skills,
experience limits, education levels, and domain expectations.
"""

import re
from typing import Any
from app.schemas.job_description import (
    CategorizedRequirements,
    EducationRequirement,
    ExperienceRequirement,
    SkillRequirement,
)

# Comprehensive Taxonomy for Technical, Tool, Soft, and Domain terms
TAXONOMY_SKILLS: dict[str, dict[str, Any]] = {
    # Programming Languages
    "python": {"canonical": "Python", "category": "technical", "weight": 1.0},
    "javascript": {"canonical": "JavaScript", "category": "technical", "weight": 1.0},
    "typescript": {"canonical": "TypeScript", "category": "technical", "weight": 1.0},
    "java": {"canonical": "Java", "category": "technical", "weight": 1.0},
    "c++": {"canonical": "C++", "category": "technical", "weight": 1.0},
    "c#": {"canonical": "C#", "category": "technical", "weight": 1.0},
    "golang": {"canonical": "Go", "category": "technical", "weight": 1.0},
    "go": {"canonical": "Go", "category": "technical", "weight": 0.8},
    "rust": {"canonical": "Rust", "category": "technical", "weight": 1.0},
    "ruby": {"canonical": "Ruby", "category": "technical", "weight": 0.9},
    "php": {"canonical": "PHP", "category": "technical", "weight": 0.8},
    "kotlin": {"canonical": "Kotlin", "category": "technical", "weight": 0.9},
    "swift": {"canonical": "Swift", "category": "technical", "weight": 0.9},
    "sql": {"canonical": "SQL", "category": "technical", "weight": 0.9},
    "html": {"canonical": "HTML5", "category": "technical", "weight": 0.7},
    "css": {"canonical": "CSS3", "category": "technical", "weight": 0.7},
    "bash": {"canonical": "Bash/Shell", "category": "technical", "weight": 0.8},
    "scala": {"canonical": "Scala", "category": "technical", "weight": 0.9},

    # Frameworks & Libraries
    "fastapi": {"canonical": "FastAPI", "category": "technical", "weight": 1.0},
    "django": {"canonical": "Django", "category": "technical", "weight": 1.0},
    "flask": {"canonical": "Flask", "category": "technical", "weight": 0.9},
    "react": {"canonical": "React", "category": "technical", "weight": 1.0},
    "next.js": {"canonical": "Next.js", "category": "technical", "weight": 1.0},
    "nextjs": {"canonical": "Next.js", "category": "technical", "weight": 1.0},
    "vue": {"canonical": "Vue.js", "category": "technical", "weight": 0.9},
    "angular": {"canonical": "Angular", "category": "technical", "weight": 0.9},
    "node.js": {"canonical": "Node.js", "category": "technical", "weight": 1.0},
    "nodejs": {"canonical": "Node.js", "category": "technical", "weight": 1.0},
    "express": {"canonical": "Express.js", "category": "technical", "weight": 0.9},
    "spring boot": {"canonical": "Spring Boot", "category": "technical", "weight": 1.0},
    "spring": {"canonical": "Spring Framework", "category": "technical", "weight": 0.9},
    ".net": {"canonical": ".NET", "category": "technical", "weight": 0.9},
    "tailwind": {"canonical": "Tailwind CSS", "category": "tool", "weight": 0.8},
    "graphql": {"canonical": "GraphQL", "category": "technical", "weight": 0.9},
    "rest": {"canonical": "REST APIs", "category": "technical", "weight": 0.9},
    "restful": {"canonical": "RESTful APIs", "category": "technical", "weight": 0.9},

    # Databases & Storage
    "postgresql": {"canonical": "PostgreSQL", "category": "technical", "weight": 1.0},
    "postgres": {"canonical": "PostgreSQL", "category": "technical", "weight": 1.0},
    "mysql": {"canonical": "MySQL", "category": "technical", "weight": 0.9},
    "sqlite": {"canonical": "SQLite", "category": "technical", "weight": 0.8},
    "mongodb": {"canonical": "MongoDB", "category": "technical", "weight": 0.9},
    "redis": {"canonical": "Redis", "category": "technical", "weight": 0.9},
    "elasticsearch": {"canonical": "Elasticsearch", "category": "technical", "weight": 0.9},
    "dynamodb": {"canonical": "DynamoDB", "category": "technical", "weight": 0.9},
    "pgvector": {"canonical": "pgvector", "category": "technical", "weight": 0.9},
    "cassandra": {"canonical": "Cassandra", "category": "technical", "weight": 0.9},

    # Cloud & DevOps & Tools
    "aws": {"canonical": "AWS", "category": "tool", "weight": 1.0},
    "azure": {"canonical": "Azure", "category": "tool", "weight": 1.0},
    "gcp": {"canonical": "Google Cloud (GCP)", "category": "tool", "weight": 1.0},
    "docker": {"canonical": "Docker", "category": "tool", "weight": 1.0},
    "kubernetes": {"canonical": "Kubernetes", "category": "tool", "weight": 1.0},
    "k8s": {"canonical": "Kubernetes", "category": "tool", "weight": 1.0},
    "terraform": {"canonical": "Terraform", "category": "tool", "weight": 0.9},
    "ansible": {"canonical": "Ansible", "category": "tool", "weight": 0.8},
    "git": {"canonical": "Git", "category": "tool", "weight": 0.9},
    "github": {"canonical": "GitHub", "category": "tool", "weight": 0.8},
    "gitlab": {"canonical": "GitLab", "category": "tool", "weight": 0.8},
    "ci/cd": {"canonical": "CI/CD", "category": "methodology", "weight": 0.9},
    "jenkins": {"canonical": "Jenkins", "category": "tool", "weight": 0.8},
    "linux": {"canonical": "Linux", "category": "technical", "weight": 0.8},

    # AI / ML / Data Science
    "machine learning": {"canonical": "Machine Learning", "category": "technical", "weight": 1.0},
    "deep learning": {"canonical": "Deep Learning", "category": "technical", "weight": 1.0},
    "pytorch": {"canonical": "PyTorch", "category": "technical", "weight": 1.0},
    "tensorflow": {"canonical": "TensorFlow", "category": "technical", "weight": 1.0},
    "scikit-learn": {"canonical": "Scikit-Learn", "category": "technical", "weight": 0.9},
    "pandas": {"canonical": "Pandas", "category": "technical", "weight": 0.9},
    "numpy": {"canonical": "NumPy", "category": "technical", "weight": 0.8},
    "nlp": {"canonical": "Natural Language Processing (NLP)", "category": "technical", "weight": 1.0},
    "llm": {"canonical": "LLMs", "category": "technical", "weight": 1.0},
    "rag": {"canonical": "Retrieval-Augmented Generation (RAG)", "category": "technical", "weight": 1.0},
    "langchain": {"canonical": "LangChain", "category": "technical", "weight": 0.9},

    # Soft Skills & Behavioral
    "communication": {"canonical": "Strong Communication", "category": "soft", "weight": 0.8},
    "collaboration": {"canonical": "Team Collaboration", "category": "soft", "weight": 0.8},
    "leadership": {"canonical": "Technical Leadership", "category": "soft", "weight": 0.9},
    "mentorship": {"canonical": "Mentorship", "category": "soft", "weight": 0.8},
    "problem solving": {"canonical": "Problem Solving", "category": "soft", "weight": 0.8},
    "agile": {"canonical": "Agile / Scrum", "category": "methodology", "weight": 0.8},
    "scrum": {"canonical": "Scrum", "category": "methodology", "weight": 0.8},
    "microservices": {"canonical": "Microservices Architecture", "category": "methodology", "weight": 1.0},
    "system design": {"canonical": "System Design", "category": "technical", "weight": 1.0},
}

DOMAIN_KEYWORDS: dict[str, str] = {
    "fintech": "Financial Technology (FinTech)",
    "finance": "Finance & Banking",
    "banking": "Banking",
    "healthcare": "Healthcare & MedTech",
    "healthtech": "Healthcare Technology",
    "e-commerce": "E-Commerce",
    "ecommerce": "E-Commerce",
    "saas": "SaaS / Cloud Software",
    "cybersecurity": "Cybersecurity & InfoSec",
    "security": "Information Security",
    "edtech": "Educational Technology (EdTech)",
    "telecom": "Telecommunications",
    "crypto": "Blockchain / Crypto",
    "blockchain": "Blockchain",
    "automotive": "Automotive / Mobility",
}


class NLPExtractor:
    """Performs deterministic NLP extraction and heuristic parsing on job descriptions."""

    @classmethod
    def extract_seniority(cls, text: str, title: str | None = None) -> tuple[str, float | None, float | None]:
        """Extracts seniority level and experience range in years."""
        text_lower = text.lower()
        title_lower = (title or "").lower()
        seniority = "Not Specified"
        min_years: float | None = None
        max_years: float | None = None

        # 1. Experience regex: "3-5 years", "3 to 5 years", "4+ years", "minimum 3 years"
        range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:\+)?\s*years?", text_lower)
        if range_match:
            min_years = float(range_match.group(1))
            max_years = float(range_match.group(2))
        else:
            single_match = re.search(r"(?:at least|minimum|min|over|\+)?\s*(\d+(?:\.\d+)?)\s*\+?\s*years?(?:\s+of)?\s+(?:experience|exp|hands-on)?", text_lower)
            if single_match:
                min_years = float(single_match.group(1))

        # 2. Check title directly if available
        first_line_lower = text_lower.splitlines()[0] if text_lower else ""
        title_combined = f"{title_lower} {first_line_lower}"

        if re.search(r"\b(lead|staff|principal|architect)\b", title_combined):
            seniority = "Lead / Staff"
        elif re.search(r"\b(director|vp|vice president|head of|chief|cto|executive)\b", title_combined):
            seniority = "Executive"
        elif re.search(r"\b(senior|sr\.?)\b", title_combined):
            seniority = "Senior"
        elif re.search(r"\b(entry[-\s]?level|graduate|associate|junior|jr\.?)\b", title_combined):
            seniority = "Entry-Level"
        elif re.search(r"\b(intern|internship)\b", title_combined):
            seniority = "Intern"
        elif re.search(r"\b(mid[-\s]?level|intermediate)\b", title_combined):
            seniority = "Mid-Level"
        else:
            # 3. Analyze body text, ignoring phrases like "mentor junior", "train juniors"
            filtered_body = re.sub(r"(?i)\b(mentor|train|lead|guide|coach|supervise)\s+(junior|entry[-\s]?level|interns?)\b", "", text_lower)

            if re.search(r"\b(lead|staff|principal|architect)\b", filtered_body):
                seniority = "Lead / Staff"
            elif re.search(r"\b(director|vp|vice president|head of|chief|executive)\b", filtered_body):
                seniority = "Executive"
            elif re.search(r"\b(senior|sr\.?)\b", filtered_body):
                seniority = "Senior"
            elif min_years is not None and min_years >= 5:
                seniority = "Senior"
            elif min_years is not None and min_years >= 2:
                seniority = "Mid-Level"
            elif re.search(r"\b(entry[-\s]?level|graduate|junior|jr\.?)\b", filtered_body):
                seniority = "Entry-Level"
            elif re.search(r"\b(intern|internship)\b", filtered_body):
                seniority = "Intern"
            elif min_years is not None and min_years < 2:
                seniority = "Entry-Level"
            elif re.search(r"\b(mid[-\s]?level|developer|engineer|analyst)\b", filtered_body):
                seniority = "Mid-Level"

        return seniority, min_years, max_years


    @classmethod
    def extract_education(cls, text: str) -> EducationRequirement:
        """Extracts degrees and fields of study from JD text."""
        text_lower = text.lower()
        degree_level = "Not Specified"
        fields: list[str] = []
        is_req = False

        if re.search(r"\b(ph\.?d|doctorate)\b", text_lower):
            degree_level = "PhD / Doctorate"
        elif re.search(r"\b(master'?s|m\.?s|mca|m\.?tech|mba)\b", text_lower):
            degree_level = "Master's"
        elif re.search(r"\b(bachelor'?s|b\.?s|b\.?e|b\.?tech|bca|undergraduate|degree in)\b", text_lower):
            degree_level = "Bachelor's"
        elif re.search(r"\b(diploma|high school|associate degree)\b", text_lower):
            degree_level = "High School / Diploma"

        # Check fields of study
        if re.search(r"\bcomputer\s+science\b", text_lower):
            fields.append("Computer Science")
        if re.search(r"\bsoftware\s+engineering\b", text_lower):
            fields.append("Software Engineering")
        if re.search(r"\binformation\s+technology\b", text_lower):
            fields.append("Information Technology")
        if re.search(r"\bdata\s+science\b", text_lower):
            fields.append("Data Science")
        if re.search(r"\belectrical\s+engineering\b", text_lower):
            fields.append("Electrical Engineering")
        if re.search(r"\brelated\s+(field|discipline|degree)\b", text_lower):
            fields.append("Related Technical Field")

        if degree_level != "Not Specified":
            is_req = bool(re.search(r"\b(required|must have|mandatory|minimum qualification)\b", text_lower))

        return EducationRequirement(
            degree_level=degree_level,  # type: ignore[arg-type]
            fields_of_study=fields,
            is_required=is_req,
            details=[f"{degree_level} in {', '.join(fields)}"] if fields and degree_level != "Not Specified" else [],
        )

    @classmethod
    def extract_domains(cls, text: str) -> list[str]:
        """Detects industry domain keywords."""
        text_lower = text.lower()
        domains = set()
        for key, val in DOMAIN_KEYWORDS.items():
            if re.search(rf"\b{re.escape(key)}\b", text_lower):
                domains.add(val)
        return sorted(list(domains))

    @classmethod
    def extract_responsibilities(cls, text: str) -> list[str]:
        """Extracts bullet points and key responsibility sentences."""
        lines = text.splitlines()
        responsibilities = []
        is_resp_section = False

        resp_headers = [
            "responsibilities",
            "what you will do",
            "what you'll do",
            "the role",
            "key duties",
            "day-to-day",
            "scope of work",
        ]

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            lower_line = line_str.lower().rstrip(":")
            if any(h in lower_line for h in resp_headers):
                is_resp_section = True
                continue

            if is_resp_section and any(
                h in lower_line for h in ["requirements", "qualifications", "what you bring", "skills", "benefits", "about us"]
            ):
                is_resp_section = False
                continue

            if is_resp_section:
                # Check for bullet points
                cleaned = re.sub(r"^[\*\-\•\–\—\d\.\)\s]+", "", line_str).strip()
                if len(cleaned) > 15:
                    responsibilities.append(cleaned)
            elif re.match(r"^[\*\-\•\–\—]\s+(Develop|Build|Design|Create|Maintain|Lead|Collaborate|Implement|Architect|Optimize)", line_str, re.I):
                cleaned = re.sub(r"^[\*\-\•\–\—\d\.\)\s]+", "", line_str).strip()
                if len(cleaned) > 15:
                    responsibilities.append(cleaned)

        return responsibilities[:12]

    @classmethod
    def extract_skills_and_categories(
        cls, text: str
    ) -> tuple[list[str], list[str], list[SkillRequirement], list[str], list[str]]:
        """
        Extracts required vs preferred skills, detailed skill requirements,
        tools & technologies, and behavioral expectations.
        """
        text_lower = text.lower()
        lines = text.splitlines()

        # Split text into sections if possible
        required_section_text = ""
        preferred_section_text = ""
        current_section = "general"

        for line in lines:
            lower = line.strip().lower()
            if any(h in lower for h in ["preferred", "nice to have", "bonus", "desirable", "good to have", "plus"]):
                current_section = "preferred"
            elif any(h in lower for h in ["required", "must have", "minimum qualifications", "requirements", "what we're looking for"]):
                current_section = "required"
            elif any(h in lower for h in ["responsibilities", "about us", "benefits", "perks"]):
                current_section = "general"

            if current_section == "preferred":
                preferred_section_text += " " + lower
            elif current_section == "required":
                required_section_text += " " + lower

        required_skills: list[str] = []
        preferred_skills: list[str] = []
        detailed_skills: list[SkillRequirement] = []
        tools: list[str] = []
        soft_skills: list[str] = []
        seen_canonicals: set[str] = set()

        for term, data in TAXONOMY_SKILLS.items():
            pattern = rf"\b{re.escape(term)}\b"
            if re.search(pattern, text_lower):
                canonical = data["canonical"]
                if canonical in seen_canonicals:
                    continue
                seen_canonicals.add(canonical)

                category = data["category"]
                weight = data["weight"]

                # Determine if preferred or required
                in_pref = bool(re.search(pattern, preferred_section_text))
                in_req = bool(re.search(pattern, required_section_text))

                if in_pref and not in_req:
                    importance = "preferred"
                    preferred_skills.append(canonical)
                else:
                    importance = "required"
                    required_skills.append(canonical)

                if category == "tool":
                    tools.append(canonical)
                elif category == "soft":
                    soft_skills.append(canonical)

                detailed_skills.append(
                    SkillRequirement(
                        name=canonical,
                        category=category,  # type: ignore[arg-type]
                        importance=importance,  # type: ignore[arg-type]
                        weight=weight,
                        context=None,
                    )
                )

        return required_skills, preferred_skills, detailed_skills, tools, soft_skills

    @classmethod
    def extract_ats_keywords(cls, text: str, max_keywords: int = 15) -> list[str]:
        """Extracts high-salience terms suitable for ATS indexing."""
        words = re.findall(r"\b[A-Za-z][A-Za-z0-9\.\+#\-]{2,}\b", text)
        stopwords = {
            "the", "and", "for", "with", "that", "this", "from", "have", "will", "your",
            "are", "you", "our", "team", "work", "job", "company", "role", "years", "experience",
            "looking", "candidate", "ability", "skills", "knowledge", "working", "across",
            "including", "about", "other", "such", "using", "must", "well", "plus",
        }
        freq: dict[str, int] = {}
        for w in words:
            w_lower = w.lower()
            if w_lower not in stopwords and len(w) > 2:
                # Keep capitalizations if standard
                cap = w.strip(".")
                freq[cap] = freq.get(cap, 0) + 1

        sorted_kw = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [k for k, _ in sorted_kw[:max_keywords]]

    @classmethod
    def parse_job_description(cls, raw_text: str, title: str | None = None, company: str | None = None) -> CategorizedRequirements:
        """Transforms raw job description text into structured, categorized requirements."""
        seniority, min_yrs, max_yrs = cls.extract_seniority(raw_text, title=title)

        education = cls.extract_education(raw_text)
        domains = cls.extract_domains(raw_text)
        responsibilities = cls.extract_responsibilities(raw_text)
        req_skills, pref_skills, detailed_skills, tools, soft_skills = cls.extract_skills_and_categories(raw_text)
        keywords = cls.extract_ats_keywords(raw_text)

        # Infer job title if not provided
        derived_title = title.strip() if title and title.strip() else ""
        if not derived_title:
            first_line = raw_text.strip().splitlines()[0] if raw_text.strip() else ""
            if len(first_line) < 60 and ("engineer" in first_line.lower() or "developer" in first_line.lower() or "manager" in first_line.lower()):
                derived_title = first_line.strip("# -:")
            else:
                derived_title = f"{seniority if seniority != 'Not Specified' else ''} Software Professional".strip()

        exp_details = []
        if min_yrs is not None and max_yrs is not None:
            exp_details.append(f"{min_yrs}-{max_yrs} years of relevant industry experience")
        elif min_yrs is not None:
            exp_details.append(f"Minimum {min_yrs}+ years of professional experience")

        exp_req = ExperienceRequirement(
            min_years=min_yrs,
            max_years=max_yrs,
            seniority_level=seniority,  # type: ignore[arg-type]
            details=exp_details,
        )

        # Generate summary
        summary = (
            f"Target {derived_title} role requiring proficiency in {', '.join(req_skills[:4]) or 'core technical competencies'}"
            f" with {seniority.lower()} experience."
        )

        return CategorizedRequirements(
            job_title=derived_title,
            company=company.strip() if company and company.strip() else None,
            summary=summary,
            seniority_level=seniority,
            required_skills=req_skills,
            preferred_skills=pref_skills,
            skills_detailed=detailed_skills,
            responsibilities=responsibilities,
            experience_requirements=exp_req,
            education_requirements=education,
            tools_and_technologies=tools,
            domain_knowledge=domains,
            behavioral_expectations=soft_skills,
            keywords=keywords,
        )
