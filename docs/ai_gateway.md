# FreeResume — AI Gateway & Dual-Mode Architecture

This document details the design, configuration, failure handling, and cost-containment rules of the Shared AI Gateway.

---

## 1. Dual-Mode Architecture Overview

To balance **₹0 free-tier local engineering** for student development and **reliable public demonstration** during viva presentations, the platform employs a dual-mode AI Gateway:

```text
                               ┌─────────────────────────┐
                               │     Business Logic      │
                               │ (Evaluator / Parser /   │
                               │   Version Optimizer)    │
                               └────────────┬────────────┘
                                            │ Typed Request
                                            ▼
                               ┌─────────────────────────┐
                               │       AI Gateway        │
                               │  (Timeout, Retries, CB) │
                               └────────────┬────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
      `LLM_PROVIDER=ollama`                           `LLM_PROVIDER=azure_openai`
      [Local Development Mode]                        [Deployed Production Mode]
                    │                                               │
                    ▼                                               ▼
         ┌─────────────────────┐                         ┌─────────────────────┐
         │ Ollama Instance     │                         │ Azure OpenAI        │
         │ (llama3.2:3b /      │                         │ (gpt-4o-mini)       │
         │  mistral:7b)        │                         │ Capped Spend Alert  │
         │ Port 11434          │                         │ TLS HTTPS Endpoint  │
         │ ₹0 compute cost     │                         │ Key Authenticated   │
         └─────────────────────┘                         └─────────────────────┘
```

---

## 2. Environment Configuration

The runtime mode is switched via environment variables in `.env` without modifying business logic code:

| Variable | Local Mode (Ollama) | Deployed Mode (Azure OpenAI) | Description |
|---|---|---|---|
| `LLM_PROVIDER` | `ollama` | `azure_openai` | Determines the active routing provider |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | — | HTTP URL of local Ollama daemon |
| `OLLAMA_MODEL` | `llama3.2:3b` | — | Local LLM model tag |
| `AZURE_OPENAI_ENDPOINT` | — | `https://<resource>.openai.azure.com/` | Azure OpenAI REST endpoint |
| `AZURE_OPENAI_API_KEY` | — | `[SECRET_KEY]` | Authenticated Azure API Key |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | — | `gpt-4o-mini` | Targeted lightweight deployment |
| `AZURE_OPENAI_API_VERSION` | — | `2024-08-01-preview` | Supported API version |

---

## 3. Resilience, Circuit Breakers & Graceful Failure

1. **Timeout**: Every AI request is wrapped in a 30-second strict timeout (`AI_TIMEOUT_SECONDS=30`).
2. **Bounded Retry**: Failed transient HTTP connections are retried up to 2 times with exponential backoff (`AI_MAX_RETRIES=2`).
3. **Circuit Breaker**:
   - If 3 consecutive failures occur (`AI_CIRCUIT_BREAKER_FAILURES=3`), the circuit breaker trips **OPEN** for 60 seconds (`AI_CIRCUIT_BREAKER_RESET_SECONDS=60`).
   - While OPEN, new AI requests immediately return a typed `AIUnavailable` error response rather than causing cascading upstream delays.
4. **Honest Reporting Principle**:
   - When Azure OpenAI or Ollama is unreachable or rate-limited, the system displays an honest status: *"AI evaluation service is temporarily unavailable. Please try again in a moment."*
   - **No Canned Mock Substitution**: The system explicitly avoids serving fake static mock outputs that masquerade as live model evaluations.

---

## 4. Free-Tier Cost Controls for Azure OpenAI

For deployed / online mode:
- **Model Tier**: Exclusively use lightweight mini-class models (`gpt-4o-mini`) rather than flagship models to minimize token expenditure.
- **Budget Spend Cap**: Hard spending limits (e.g., $5.00/month) and billing alert thresholds (50%, 75%, 90%) configured in the Azure Cost Management portal.
- **Rate Limiting**: Public `/api/v1/evaluations` endpoints are rate-limited to 20 calls/minute to prevent abuse or bot-driven billing spikes.
- **Secret Hygiene**: Azure keys are injected exclusively via hosting environment secret managers (e.g., Render Environment Variables) and never committed to Git.
