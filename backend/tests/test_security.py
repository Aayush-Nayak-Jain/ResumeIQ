"""Tests for password hashing and JWT token operations."""

from datetime import timedelta

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing():
    """Verify password hash generation and verification."""
    password = "MySecurePassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_access_token_creation_and_decoding():
    """Verify JWT access token generation and payload decoding."""
    payload = {"sub": "user-12345", "role": "candidate"}
    token = create_access_token(payload, expires_delta=timedelta(minutes=15))
    assert isinstance(token, str)

    decoded = decode_token(token)
    assert decoded["sub"] == "user-12345"
    assert decoded["role"] == "candidate"
    assert decoded["type"] == "access"
    assert "exp" in decoded


def test_jwt_refresh_token_creation():
    """Verify JWT refresh token creation."""
    payload = {"sub": "user-12345"}
    token = create_refresh_token(payload)
    decoded = decode_token(token)
    assert decoded["sub"] == "user-12345"
    assert decoded["type"] == "refresh"
