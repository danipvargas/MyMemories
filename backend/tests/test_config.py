from pathlib import Path

import pytest

from src import config


def test_load_auth_secret_reads_mounted_file(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
):
    secret = "a" * 32
    secret_path = tmp_path / "auth_secret_key"
    secret_path.write_text(f"{secret}\n", encoding="utf-8")

    monkeypatch.setattr(config, "APP_ENV", "production")
    monkeypatch.setenv("AUTH_SECRET_KEY_FILE", str(secret_path))
    monkeypatch.delenv("AUTH_SECRET_KEY", raising=False)

    assert config._load_auth_secret() == secret


def test_load_auth_secret_rejects_file_path_as_key(
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(config, "APP_ENV", "production")
    monkeypatch.delenv("AUTH_SECRET_KEY_FILE", raising=False)
    monkeypatch.setenv("AUTH_SECRET_KEY", "/run/secrets/auth_secret_key")

    with pytest.raises(RuntimeError, match="file path"):
        config._load_auth_secret()


def test_production_requires_secure_cookies(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(config, "APP_ENV", "production")
    monkeypatch.setenv("AUTH_COOKIE_SECURE", "false")

    with pytest.raises(RuntimeError, match="AUTH_COOKIE_SECURE"):
        config._load_cookie_secure()
