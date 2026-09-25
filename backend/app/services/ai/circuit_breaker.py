"""Circuit Breaker pattern implementation for AI Gateway resilience.

Enforces graceful degradation and prevents cascading timeout storms when
local Ollama is unstarted or Azure OpenAI rate limits occur (Section 8.1).
"""

import time
from enum import Enum
from app.core.logging import logger


class CircuitState(str, Enum):
    CLOSED = "CLOSED"      # Normal operation, calls allowed
    OPEN = "OPEN"          # Tripped, calls fast-rejected with AIUnavailableException
    HALF_OPEN = "HALF_OPEN"  # Trial state, testing if service recovered


class CircuitBreaker:
    """Thread/async-safe circuit breaker protecting downstream LLM endpoints."""

    def __init__(
        self,
        failure_threshold: int = 3,
        recovery_timeout_seconds: float = 60.0,
        provider_name: str = "llm_gateway",
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        self.provider_name = provider_name
        self.state = CircuitState.CLOSED
        self.consecutive_failures = 0
        self.last_failure_time: float | None = None
        self.last_state_change: float = time.time()

    def allow_request(self) -> bool:
        """Determines if a downstream call should be permitted."""
        now = time.time()

        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            # Check if cooldown has elapsed
            if self.last_failure_time and (now - self.last_failure_time >= self.recovery_timeout_seconds):
                logger.info(
                    "Circuit breaker for %s transitioning from OPEN to HALF_OPEN after %.1fs cooldown",
                    self.provider_name,
                    now - self.last_failure_time,
                )
                self.state = CircuitState.HALF_OPEN
                self.last_state_change = now
                return True
            return False

        if self.state == CircuitState.HALF_OPEN:
            # Allow limited trial probe
            return True

        return False

    def record_success(self) -> None:
        """Records a successful LLM invocation and resets failure counters."""
        if self.state != CircuitState.CLOSED:
            logger.info("Circuit breaker for %s recovered and reset to CLOSED state", self.provider_name)
        self.state = CircuitState.CLOSED
        self.consecutive_failures = 0
        self.last_failure_time = None
        self.last_state_change = time.time()

    def record_failure(self, error_summary: str | None = None) -> None:
        """Records an invocation failure and trips circuit if threshold exceeded."""
        self.consecutive_failures += 1
        self.last_failure_time = time.time()
        self.last_state_change = self.last_failure_time

        logger.warning(
            "AI Gateway failure recorded for %s [consecutive=%d/%d, reason=%s]",
            self.provider_name,
            self.consecutive_failures,
            self.failure_threshold,
            error_summary or "Unknown",
        )

        if self.consecutive_failures >= self.failure_threshold:
            if self.state != CircuitState.OPEN:
                logger.error(
                    "Circuit breaker tripped to OPEN for %s after %d consecutive failures. Cooling down for %.0fs.",
                    self.provider_name,
                    self.consecutive_failures,
                    self.recovery_timeout_seconds,
                )
            self.state = CircuitState.OPEN

    def reset(self) -> None:
        """Manually forces the circuit breaker back to CLOSED."""
        self.state = CircuitState.CLOSED
        self.consecutive_failures = 0
        self.last_failure_time = None
        self.last_state_change = time.time()
