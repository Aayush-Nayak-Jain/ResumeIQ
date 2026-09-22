# AI Resume Intelligence Platform

> 🚧 **Development in Progress** — this project is actively being built. Core modules are under construction; features listed below reflect the planned/target scope and may not all be implemented yet.

## Overview

The **AI Resume Intelligence Platform** helps job seekers create, evaluate, optimize, and tailor resumes for specific job opportunities.

Rather than acting as a simple resume builder or keyword checker, it analyzes the relationship between a candidate's resume and a target job description using natural language processing, semantic matching, and LLM-based evaluation. The goal is to close the gap between what a candidate wrote, what a job actually requires, and what an ATS or recruiter will evaluate — and to give **actionable recommendations**, not just a score.

### Problem it solves

Candidates often send the same resume to many jobs even though each posting emphasizes different skills and evidence. Common resume tools focus on formatting, keyword matching, or generic AI rewriting, which leaves several problems unsolved:

- Semantically-implied skills get missed because they weren't stated in the JD's exact words.
- A resume can list a skill with no evidence it was actually used.
- Candidates don't know which parts of their resume draw the most attention.
- One resume can't optimally represent a candidate for every role.
- Keyword-stuffing can substitute for actually improving the resume's substance.

## Features

- **Resume Builder & Parser** — structured fields for personal info, summary, education, skills, experience, projects, certifications, and links. Accepts PDF/DOCX and extracts them into a normalized structured format.
- **Job Description Analysis** — extracts required/preferred skills, responsibilities, and requirements from a pasted job description.
- **Semantic ATS Matching** — combines exact keyword matching with embedding-based semantic similarity, so a skill phrased differently in the resume vs. the JD is still recognized as a match. Match score is a configurable weighted blend of skills, experience, projects, education, semantic similarity, and certifications.
- **Skill Gap Analysis** — classifies each JD skill as Strong Match / Partial Match / Missing, prioritized by importance.
- **Evidence Quality Analysis** — flags resume bullets that list a skill without showing it was actually used, and suggests what kind of proof would strengthen them (without inventing that proof).
- **Recruiter Attention Heatmap** — an AI-derived estimate (not real eye-tracking) of which resume sections are likely to draw the most attention.
- **AI Resume Evaluation** — a composite, multi-dimension score (job match, semantic skill match, evidence quality, achievement strength, section completeness, readability, ATS compatibility) always returned with an explanation.
- **Multi-Version Resume Intelligence** — maintains one master candidate profile and generates role-specific resume versions from it, comparing them against new job descriptions and recommending the closest fit or flagging the need for a new version.
- **AI Resume Optimization** — recommendations and rewrite suggestions grounded strictly in facts the candidate actually provided; nothing is fabricated, and changes require candidate approval before replacing original content.
- **ATS-Safe Export** — export a finalized resume to PDF/DOCX.

## Architecture

```text
                 Web / Mobile Client (Candidate, Admin)
                              │
                       API Gateway (Auth, Routing, Rate Limiting, RBAC)
                              │
              ┌───────────────┴────────────────┐
              │                                 │
   Resume Intelligence Module          (Future: Job / Recruiter / Interview Modules)
   • Builder • Parser • ATS analysis
   • Tailoring • Versions
              │
              ▼
                  Shared AI Platform
   • AI Gateway (local-first, pluggable providers)
   • Embedding Service   • Skill Taxonomy
   • Semantic Matching   • Scoring Engine
              │
              ▼
     Data Layer: PostgreSQL (Supabase) + pgvector + Object Storage
              │
              ▼
        Event / Workflow Layer  →  Analytics Layer
```

Built as a **modular monolith**, not microservices, for the MVP:

```text
Docker Compose → Next.js (frontend) + FastAPI (backend) + Worker
                              │
                  PostgreSQL/pgvector (Supabase) + Redis (jobs/cache)
```

The core design principle: reusable AI/data services (skill extraction, embeddings, semantic matching, scoring) are built once behind a shared AI Gateway, and consumed by the resume module now and by future job/recruiter/interview modules later — without a rewrite.

### AI Runtime — dual mode

The AI Gateway routes LLM calls through a single environment-driven switch (`LLM_PROVIDER=ollama|azure_openai`), so business logic never needs to know which mode it's in:

- **Local development** → **Ollama**, running on-machine. No API key, no per-token cost.
- **Deployed / live demo** → a small, budget-capped **Azure OpenAI** endpoint, since the free hosting tier can't run local inference.

Every AI Gateway call has a timeout, bounded retry with backoff, and a circuit breaker. If the AI provider is unavailable, the app returns an honest "temporarily unavailable" message — it never silently falls back to cached or mock output.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js / React |
| Backend | FastAPI (Python) |
| Database | Supabase PostgreSQL (free tier) |
| Vector search | pgvector (same Supabase instance) |
| LLM | Dual-mode — Ollama (local) / Azure OpenAI (deployed) |
| Embeddings | Sentence Transformers (local, both modes) |
| Document parsing | PyMuPDF / pdfplumber (PDF), python-docx (DOCX) |
| NLP | spaCy |
| OCR (optional) | Tesseract / PaddleOCR |
| Hosting — frontend | Vercel Hobby |
| Hosting — backend | Render (free web service) |
| CI/CD | GitHub Actions |
| Deployment | Docker Compose (local) · Render + Vercel + Supabase (public demo) |

## Security & Privacy

Resumes are PII-heavy documents, so security is treated as a first-class concern throughout, not a final pass:

- Password hashing, short-lived JWT access + refresh tokens.
- Strict per-user authorization on every resource (no IDOR).
- Upload validation: type/size limits, MIME verification, no execution of uploaded files.
- Encryption at rest for stored resumes and extracted personal data.
- A working "delete my data" flow.
- Rate limiting on AI-evaluation endpoints.
- No resume content or PII in application logs.
- Pasted job descriptions and resume content are treated as **untrusted input** to the LLM, with defenses against prompt injection.
- Secrets managed via environment variables / a secrets manager only — never committed to source control.

## AI Integrity Rules

The AI is never allowed to invent employment history, projects, certifications, technologies, metrics, degrees, or achievements. Every generated claim or recommendation must be traceable to something the candidate actually provided — when evidence is missing, the system suggests adding real evidence rather than fabricating content. All AI-generated edits require candidate approval before replacing original content.

## Scope

This MVP is scoped for a single-developer academic project with two roles: **Candidate** and **Administrator**. Recruiter-facing features, bulk job ingestion, and AI voice interviews are designed for architecturally but are explicitly out of scope for this release (see Future Scope below).

### Future Scope

- Job Discovery & Market Matching (bulk job ingestion, search)
- Recruiter Operations (job posting, candidate ranking, pipeline)
- AI Interview Intelligence (question generation, scored interview sessions)
- Skill-gap learning roadmap, career trajectory analysis, resume credibility detection, salary estimation

## Status

Currently in active development. See the project's development plan for the phased build-out and current progress.
