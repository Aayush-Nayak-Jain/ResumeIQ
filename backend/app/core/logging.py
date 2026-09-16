"""Structured Logging Configuration with PII & Credential Redaction Filter."""

import logging
import re
import sys


class PIIFilter(logging.Filter):
    """Logging filter that sanitizes sensitive PII (emails, JWT tokens, passwords)

    from log records before output.
    """

    EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
    BEARER_PATTERN = re.compile(
        r"Bearer\s+[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*",
        re.IGNORECASE,
    )
    PASSWORD_PATTERN = re.compile(
        r'("password"|"secret"|"api_key"|"token")\s*:\s*"[^"]+"',
        re.IGNORECASE,
    )

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.sanitize(record.msg)
        if record.args:
            if isinstance(record.args, tuple):
                record.args = tuple(
                    self.sanitize(arg) if isinstance(arg, str) else arg for arg in record.args
                )
            elif isinstance(record.args, dict):
                record.args = {
                    k: self.sanitize(v) if isinstance(v, str) else v for k, v in record.args.items()
                }
        return True

    @classmethod
    def sanitize(cls, text: str) -> str:
        """Sanitize text against PII and credential patterns."""
        if not isinstance(text, str):
            return text
        sanitized = cls.EMAIL_PATTERN.sub("[REDACTED_EMAIL]", text)
        sanitized = cls.BEARER_PATTERN.sub("Bearer [REDACTED_TOKEN]", sanitized)
        sanitized = cls.PASSWORD_PATTERN.sub(r'\1: "[REDACTED]"', sanitized)
        return sanitized


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configures application-wide logging with PII hygiene filter."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Remove existing handlers to prevent duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(formatter)
    console_handler.addFilter(PIIFilter())

    root_logger.addHandler(console_handler)
    return logging.getLogger("resume_intelligence")


logger = logging.getLogger("resume_intelligence")
