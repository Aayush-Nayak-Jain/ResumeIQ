"""Tests for application settings and environment validation."""

from app.core.config import Settings


def test_default_settings():
    """Verify default settings instantiation and properties."""
    s = Settings()
    assert s.app_name == "FreeResume"
    assert s.llm_provider in ("ollama", "azure_openai")
    assert isinstance(s.cors_origins_list, list)
    assert len(s.cors_origins_list) > 0


def test_cors_origins_parser():
    """Verify comma-separated CORS origin string is parsed correctly."""
    s = Settings(cors_origins="https://app.example.com, https://preview.example.com ")
    assert s.cors_origins_list == ["https://app.example.com", "https://preview.example.com"]
