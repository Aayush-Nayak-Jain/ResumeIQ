# AI Resume Intelligence Platform — Database & Vector Storage Architecture

This document describes the PostgreSQL 16 + `pgvector` data architecture designed for the AI Resume Intelligence Platform.

---

## 1. Relational Entities Overview

```text
users (1) ──── (1) candidate_profiles
  │
  ├─── (1:N) resumes ──── (1:N) resume_versions
  │             │
  │             ├─── (1:N) evaluations ──── (N:1) job_descriptions
  │
  ├─── (1:N) job_descriptions
  ├─── (1:N) embeddings (pgvector)
  └─── (1:N) audit_events
```

---

## 2. Table Specifications

### 2.1 `users`
Core user identity and authentication credentials.
- `id` (UUID, PK): Unique user identifier.
- `email` (VARCHAR(255), UNIQUE, NOT NULL): User email address.
- `password_hash` (VARCHAR(255), NOT NULL): Argon2id / bcrypt password hash.
- `full_name` (VARCHAR(255), NOT NULL): Candidate or administrator full name.
- `role` (VARCHAR(50), NOT NULL): `candidate` or `admin` (enforced via CHECK constraint).
- `is_active` (BOOLEAN, DEFAULT true): Soft status flag.
- `created_at`, `updated_at` (TIMESTAMPTZ).

### 2.2 `candidate_profiles`
The **Single Source of Truth** for candidate facts. Role-specific resumes are derived from this entity.
- `id` (UUID, PK)
- `user_id` (UUID, UNIQUE, FK -> `users.id` ON DELETE CASCADE)
- `headline` (VARCHAR(255)): Professional headline.
- `summary` (TEXT): Comprehensive master summary.
- `contact_info` (JSONB): Phone, location, LinkedIn, GitHub, portfolio URLs.
- `skills` (JSONB): Array of skill entities `{ "name": "FastAPI", "category": "backend", "proficiency": "expert" }`.
- `experience` (JSONB): Array of verified employment history records with bullet points and metrics.
- `education` (JSONB): Degrees, universities, graduation dates, CGPA.
- `projects` (JSONB): Projects with tech stacks, measurable outcomes, and repository links.
- `certifications` (JSONB): Official certifications with credential IDs and dates.
- `achievements`, `publications`, `links` (JSONB).

### 2.3 `resumes`
Master and tailored resume documents.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE)
- `title` (VARCHAR(255)): Human-readable label (e.g., "Fullstack Developer Resume").
- `target_role` (VARCHAR(255)): Target role title (e.g., "Senior Python Backend Engineer").
- `is_master` (BOOLEAN, DEFAULT false): Indicates if this is the baseline master resume.
- `parent_version_id` (UUID, FK -> `resumes.id`): Parent resume ID if branched.
- `version_number` (INT, DEFAULT 1): Monotonically increasing version index.
- `raw_text` (TEXT): Cleaned raw text extracted from uploaded document.
- `structured_data` (JSONB): Normalized JSON representation matching the internal resume schema.
- `file_url`, `file_name`, `file_type`, `file_size_bytes`: Storage metadata.
- `status` (VARCHAR(50)): `draft`, `parsing`, `parsed`, `evaluated`, `optimized`, `error`.

### 2.4 `resume_versions`
Immutable snapshot history of resume modifications and role-specific adaptations.
- `id` (UUID, PK)
- `resume_id` (UUID, FK -> `resumes.id` ON DELETE CASCADE)
- `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE)
- `version_number` (INT): Snapshot sequence number.
- `role_name` (VARCHAR(255)): Targeted role or version label.
- `structured_data` (JSONB): Snapshot content.
- `diff_summary` (JSONB): Structured diff vs previous version.

### 2.5 `job_descriptions`
Target job postings pasted by candidates for compatibility analysis.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE)
- `title` (VARCHAR(255)): Position title.
- `company` (VARCHAR(255)): Organization name.
- `raw_text` (TEXT): Full pasted JD text.
- `structured_requirements` (JSONB): Categorized requirements (required_skills, preferred_skills, responsibilities, years_experience, tools, education).
- `weights_config` (JSONB): Configurable evaluation weights (default: 40% skills, 20% experience, 15% projects, 10% education, 10% semantic similarity, 5% certs).

### 2.6 `evaluations`
AI evaluation results computed for a resume-JD pair.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE)
- `resume_id` (UUID, FK -> `resumes.id` ON DELETE CASCADE)
- `job_description_id` (UUID, FK -> `job_descriptions.id` ON DELETE CASCADE)
- `composite_score` (NUMERIC(5,2)): 0.00 to 100.00.
- `scores_breakdown` (JSONB): Detailed dimension scores.
- `skill_gap_analysis` (JSONB): Strong, Partial, and Missing skills.
- `evidence_quality_analysis` (JSONB): Weak statements and proof enhancement suggestions.
- `attention_heatmap` (JSONB): Salience distribution across resume sections.
- `recommendations` (JSONB): Actionable bullet point improvements grounded in facts.
- `explanation` (TEXT): Transparent AI explanation for the overall evaluation.
- `llm_provider` (VARCHAR(50)): `ollama` or `azure_openai`.

### 2.7 `embeddings` (pgvector)
Dense vector embeddings representing resume sections, skills, and JD requirements.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE): Ensures strict data isolation during vector similarity search.
- `entity_type` (VARCHAR(50)): `resume_section`, `skill`, `jd_requirement`, `project`, `experience`.
- `entity_id` (UUID): ID of the parent entity.
- `section_name` (VARCHAR(100)): E.g., `experience_bullet`, `technical_skills`.
- `content` (TEXT): Text content converted into vector.
- `embedding` (`vector(384)`): 384-dimensional dense vector (`all-MiniLM-L6-v2`).
- `metadata` (JSONB): Additional classification properties.

#### Vector Index:
```sql
CREATE INDEX idx_embeddings_vector_cosine 
ON embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```
- **HNSW (Hierarchical Navigable Small World)** provides sub-millisecond approximate nearest neighbor search with high recall.
