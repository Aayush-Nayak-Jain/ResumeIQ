"""Exceptions for AI Gateway and Resume Intelligence services."""


class AIServiceException(Exception):
    """Base exception for all AI Gateway and AI pipeline errors."""

    def __init__(self, message: str, provider: str | None = None, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status_code = status_code


class AIUnavailableException(AIServiceException):
    """
    Raised when the AI model provider (Ollama or Azure OpenAI) is unreachable,
    rate-limited, or when the circuit breaker is open.
    """

    def __init__(
        self,
        message: str = "AI evaluation is temporarily unavailable — please try again in a moment.",
        provider: str | None = None,
        is_circuit_open: bool = False,
    ):
        super().__init__(message=message, provider=provider, status_code=503)
        self.is_circuit_open = is_circuit_open


class AIParsingException(AIServiceException):
    """Raised when LLM output cannot be parsed into the expected JSON schema."""

    def __init__(self, message: str = "Failed to parse structured AI output into expected schema.", provider: str | None = None):
        super().__init__(message=message, provider=provider, status_code=502)


class PromptInjectionWarning(AIServiceException):
    """Raised when an untrusted input contains severe prompt injection patterns."""

    def __init__(self, message: str = "Input contains potentially adversarial instruction patterns.", provider: str | None = None):
        super().__init__(message=message, provider=provider, status_code=400)
