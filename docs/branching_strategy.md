# Branching & Version Control Strategy

This repository follows a disciplined Git workflow to ensure stability, traceability, and code quality across all 12 development phases.

## 1. Branch Hierarchy

```text
main (Protected, Production-Ready / Stable Releases)
  └── develop (Integration branch for ongoing sprint/phase work)
        ├── feat/phase0-baseline-setup
        ├── feat/phase1-auth-identity
        ├── feat/phase2-candidate-profile
        ├── fix/parser-column-alignment
        └── docs/security-architecture
```

### Branch Rules:
- **`main`**: The canonical production-ready branch. Only merges from `develop` via pull requests after passing all CI quality gates (linting, tests, secret scan).
- **`develop`**: Active integration branch. All feature branches merge into `develop`.
- **`feat/<phase-or-feature-name>`**: Feature branches branched from `develop`. Named clearly (e.g. `feat/auth-jwt`, `feat/ats-matching-engine`).
- **`fix/<bug-description>`**: Bug fixes for defects found during testing or review.
- **`docs/<topic>`**: Documentation updates.

---

## 2. Commit Message Conventions (Conventional Commits)

All commits should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short summary>

[optional body describing why and what changed]

[optional footer(s) like Closes #12]
```

### Allowed Types:
- `feat`: A new user-facing or platform feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect code meaning (formatting, whitespace)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process, dependencies, or auxiliary tools
- `ci`: Changes to CI/CD configuration files and scripts
- `sec`: Security improvements or vulnerability patches

### Examples:
- `feat(auth): implement JWT token pair generation and refresh rotation`
- `fix(parser): handle double-column PDF layout extraction properly`
- `sec(logging): add PII redactor to prevent candidate emails in server logs`

---

## 3. Pull Request & Quality Gate Requirements

Before any PR is merged into `develop` or `main`:
1. **Automated CI checks must pass**:
   - Backend pytest suite (100% green)
   - Frontend TypeScript check (`tsc --noEmit`) & ESLint
   - Secret scan (no leaked API keys or credentials)
2. **Code review checklist**:
   - No hardcoded secrets or environment-dependent URLs
   - Authorization checks verified (no IDOR vulnerability)
   - Unit tests added for new endpoints and business logic
   - AI Integrity rules respected (no hallucinated / fabricated candidate data)
