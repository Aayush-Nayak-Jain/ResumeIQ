# Contributing to AI Resume Intelligence Platform

Thank you for contributing to the AI Resume Intelligence Platform! Please review the guidelines below.

## Quick Start
1. Clone the repository and configure your environment:
   ```bash
   cp .env.example .env
   ```
2. Start the local environment using Docker Compose:
   ```bash
   docker compose up -d
   ```
   Or run the services locally in separate terminals:
   - Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
   - Frontend: `cd frontend && npm install && npm run dev`

## Branching & Commits
- Follow the branching model described in [docs/branching_strategy.md](file:///p:/resume/docs/branching_strategy.md).
- Use Conventional Commits (`feat:`, `fix:`, `sec:`, `docs:`, `test:`).

## Security & AI Integrity
- **Never commit `.env` or API keys.**
- Respect the **AI Integrity Rules**: AI must never invent employment history, projects, certifications, metrics, or degrees. All rewrites and gap analyses must be grounded strictly in candidate-provided facts.
- Resumes contain PII: Ensure all endpoints validate authorization and logs do not print personal contact info.
