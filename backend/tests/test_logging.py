"""Tests for PII sanitization in logging."""

from app.core.logging import PIIFilter


def test_pii_filter_redacts_email():
    """Verify email addresses are redacted from log messages."""
    text = "User john.doe@example.com logged in successfully"
    sanitized = PIIFilter.sanitize(text)
    assert "john.doe@example.com" not in sanitized
    assert "[REDACTED_EMAIL]" in sanitized


def test_pii_filter_redacts_bearer_token():
    """Verify JWT Bearer tokens are redacted from log messages."""
    text = (
        "Request authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.abc"
    )
    sanitized = PIIFilter.sanitize(text)
    assert "eyJhbGciOiJIUzI1Ni" not in sanitized
    assert "Bearer [REDACTED_TOKEN]" in sanitized


def test_pii_filter_redacts_passwords():
    """Verify passwords in JSON structures are redacted."""
    text = (
        'Authentication payload: {"email": "test@test.com", "password": "supersecretpassword123"}'
    )
    sanitized = PIIFilter.sanitize(text)
    assert "supersecretpassword123" not in sanitized
    assert '"password": "[REDACTED]"' in sanitized
