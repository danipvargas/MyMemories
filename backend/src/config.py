import os
from pathlib import Path

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
DEVELOPMENT_AUTH_SECRET = "development-only-change-me-32-bytes"

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://192.168.1.146:5173",
    ).split(",")
    if origin.strip()
]

MAP_RENDERER_URL = os.getenv("MAP_RENDERER_URL", "").rstrip("/")
MAP_DEFAULT_ZOOM = int(os.getenv("MAP_DEFAULT_ZOOM", "10"))
MAP_WIDTH = int(os.getenv("MAP_WIDTH", "600"))
MAP_HEIGHT = int(os.getenv("MAP_HEIGHT", "400"))


def _load_auth_secret() -> str:
    secret_file = os.getenv("AUTH_SECRET_KEY_FILE", "").strip()

    if secret_file:
        try:
            secret = Path(secret_file).read_text(encoding="utf-8").strip()
        except OSError as error:
            raise RuntimeError("AUTH_SECRET_KEY_FILE could not be read.") from error
    else:
        secret = os.getenv("AUTH_SECRET_KEY", "").strip()

    if not secret:
        if APP_ENV in {"development", "test"}:
            return DEVELOPMENT_AUTH_SECRET
        raise RuntimeError("A production JWT secret must be configured.")

    if APP_ENV == "production":
        if secret == DEVELOPMENT_AUTH_SECRET:
            raise RuntimeError(
                "The development JWT secret cannot be used in production."
            )
        if secret.startswith("/run/secrets/"):
            raise RuntimeError(
                "AUTH_SECRET_KEY must contain the secret, not its file path."
            )
        if len(secret) < 32:
            raise RuntimeError(
                "The production JWT secret must contain at least 32 characters."
            )

    return secret


AUTH_SECRET_KEY = _load_auth_secret()
AUTH_TOKEN_MAX_AGE = int(os.getenv("AUTH_TOKEN_MAX_AGE", str(60 * 60 * 24 * 30)))
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "lax")


def _load_cookie_secure() -> bool:
    secure = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"
    if APP_ENV == "production" and not secure:
        raise RuntimeError("AUTH_COOKIE_SECURE must be enabled in production.")
    return secure


AUTH_COOKIE_SECURE = _load_cookie_secure()
