import os

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
AUTH_SECRET_KEY = os.getenv(
    "AUTH_SECRET_KEY",
    "development-only-change-me-32-bytes",
)
AUTH_TOKEN_MAX_AGE = int(os.getenv("AUTH_TOKEN_MAX_AGE", str(60 * 60 * 24 * 30)))
AUTH_COOKIE_SECURE = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "lax")
