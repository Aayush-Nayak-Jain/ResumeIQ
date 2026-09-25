"""AI Gateway coordinating Dual-Mode LLM inference (Local Ollama vs Deployed Azure OpenAI).

Enforces:
- Environment-driven provider selection without scattering conditionals in business logic (Section 8.1)
- Circuit breaker fast-failure and bounded retries
- Typed AIUnavailableException with honest user messaging
- PII-hygienic telemetry and logging
"""

import asyncio
import json
import re
import time
from typing import Any, TypeVar

import httpx
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import logger
from app.services.ai.circuit_breaker import CircuitBreaker
from app.services.ai.exceptions import AIParsingException, AIUnavailableException

T = TypeVar("T", bound=BaseModel)


class AIGateway:
    """Unified AI Gateway with circuit breaker, timeout, retry, and JSON validation."""

    def __init__(self) -> None:
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=settings.ai_circuit_breaker_failures,
            recovery_timeout_seconds=float(settings.ai_circuit_breaker_reset_seconds),
            provider_name=settings.llm_provider,
        )

    def _extract_json_substring(self, content: str) -> str:
        """Extracts JSON substring if the model returned markdown fencing or preamble."""
        content = content.strip()
        # Remove markdown code fence ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
        if fence_match:
            return fence_match.group(1).strip()

        # Find outer-most curly braces
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            return content[start : end + 1]

        return content

    async def _call_ollama(self, system_prompt: str, user_prompt: str) -> str:
        """Sends inference request to local Ollama instance."""
        url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
        payload = {
            "model": settings.ollama_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
            },
        }

        async with httpx.AsyncClient(timeout=float(settings.ai_timeout_seconds)) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                raise httpx.HTTPStatusError(
                    f"Ollama returned HTTP {response.status_code}: {response.text[:200]}",
                    request=response.request,
                    response=response,
                )
            data = response.json()
            # Ollama /api/chat returns response in message.content
            return data.get("message", {}).get("content", "")

    async def _call_azure_openai(self, system_prompt: str, user_prompt: str) -> str:
        """Sends inference request to deployed Azure OpenAI endpoint."""
        if not settings.azure_openai_endpoint or not settings.azure_openai_api_key:
            raise AIUnavailableException(
                message="Azure OpenAI endpoint or API key is not configured.",
                provider="azure_openai",
            )

        url = (
            f"{settings.azure_openai_endpoint.rstrip('/')}/openai/deployments/"
            f"{settings.azure_openai_deployment_name}/chat/completions"
            f"?api-version={settings.azure_openai_api_version}"
        )
        headers = {
            "api-key": settings.azure_openai_api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }

        async with httpx.AsyncClient(timeout=float(settings.ai_timeout_seconds)) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise httpx.HTTPStatusError(
                    f"Azure OpenAI returned HTTP {response.status_code}",
                    request=response.request,
                    response=response,
                )
            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                raise AIParsingException("Empty choices in Azure OpenAI response.", provider="azure_openai")
            return choices[0].get("message", {}).get("content", "")

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema_class: type[T] | None = None,
    ) -> dict[str, Any]:
        """
        Executes an AI structured JSON generation request through circuit breaker and retries.
        """
        if not self.circuit_breaker.allow_request():
            logger.warning("AI Gateway call rejected: Circuit breaker is OPEN for %s", settings.llm_provider)
            raise AIUnavailableException(
                message="AI evaluation is temporarily unavailable — please try again in a moment.",
                provider=settings.llm_provider,
                is_circuit_open=True,
            )

        start_time = time.perf_counter()
        last_exception: Exception | None = None

        for attempt in range(settings.ai_max_retries + 1):
            try:
                if settings.llm_provider == "ollama":
                    raw_output = await self._call_ollama(system_prompt, user_prompt)
                elif settings.llm_provider == "azure_openai":
                    raw_output = await self._call_azure_openai(system_prompt, user_prompt)
                else:
                    raise AIUnavailableException(f"Unsupported LLM provider: {settings.llm_provider}")

                # Clean & parse JSON output
                json_str = self._extract_json_substring(raw_output)
                parsed_dict = json.loads(json_str)

                # Optional Pydantic validation
                if schema_class is not None:
                    validated = schema_class.model_validate(parsed_dict)
                    parsed_dict = validated.model_dump()

                # Record success on circuit breaker
                self.circuit_breaker.record_success()
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

                logger.info(
                    "AI Gateway completed request [provider=%s, attempt=%d, elapsed_ms=%.1f]",
                    settings.llm_provider,
                    attempt + 1,
                    elapsed_ms,
                )
                return parsed_dict

            except (httpx.RequestError, httpx.HTTPStatusError, TimeoutError) as exc:
                last_exception = exc
                logger.warning(
                    "AI Gateway attempt %d/%d failed: %s",
                    attempt + 1,
                    settings.ai_max_retries + 1,
                    str(exc),
                )
                if attempt < settings.ai_max_retries and settings.app_env != "test":
                    await asyncio.sleep(0.5 * (2**attempt))  # Exponential backoff

            except json.JSONDecodeError as exc:
                logger.error("Failed to decode JSON from AI output: %s", str(exc))
                # Do not retry JSON decode errors if model answered, fail with parsing error
                self.circuit_breaker.record_failure(f"JSONDecodeError: {str(exc)}")
                raise AIParsingException(
                    message="Model output did not adhere to required JSON structure.",
                    provider=settings.llm_provider,
                ) from exc
            except Exception as exc:
                logger.error("Unexpected error in AI Gateway invocation: %s", str(exc))
                last_exception = exc
                break

        # If retries exhausted
        self.circuit_breaker.record_failure(str(last_exception))
        raise AIUnavailableException(
            message="AI evaluation is temporarily unavailable — please try again in a moment.",
            provider=settings.llm_provider,
        ) from last_exception

    async def check_health(self) -> dict[str, Any]:
        """Probes the configured AI backend for liveness."""
        provider = settings.llm_provider
        circuit_state = self.circuit_breaker.state.value

        if provider == "ollama":
            url = f"{settings.ollama_base_url.rstrip('/')}/api/tags"
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(url)
                    is_live = resp.status_code == 200
                    return {
                        "provider": "ollama",
                        "status": "healthy" if is_live else "unreachable",
                        "model": settings.ollama_model,
                        "circuit_state": circuit_state,
                    }
            except Exception:
                return {
                    "provider": "ollama",
                    "status": "unreachable",
                    "model": settings.ollama_model,
                    "circuit_state": circuit_state,
                }
        else:
            return {
                "provider": "azure_openai",
                "status": "configured" if bool(settings.azure_openai_endpoint) else "unconfigured",
                "model": settings.azure_openai_deployment_name,
                "circuit_state": circuit_state,
            }


ai_gateway = AIGateway()
