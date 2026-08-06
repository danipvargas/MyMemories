import os

ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

MAP_RENDERER_URL = os.getenv("MAP_RENDERER_URL", "").rstrip("/")
MAP_DEFAULT_ZOOM = int(os.getenv("MAP_DEFAULT_ZOOM", "10"))
MAP_WIDTH = int(os.getenv("MAP_WIDTH", "600"))
MAP_HEIGHT = int(os.getenv("MAP_HEIGHT", "400"))
