from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING
from urllib.request import Request, urlopen

from geoalchemy2.shape import to_shape

from src.config import MAP_DEFAULT_ZOOM, MAP_HEIGHT, MAP_RENDERER_URL, MAP_WIDTH
from src.services.image import MAP_FOLDER, save_bytes

if TYPE_CHECKING:
    from src.models.postcard import Postcard

logger = logging.getLogger(__name__)

MAP_RENDERER_TIMEOUT = 30


class MapPreviewService:
    """Generate and persist a postcard map preview."""

    def generate_map_preview(self, postcard: Postcard) -> str | None:
        if not MAP_RENDERER_URL:
            logger.warning("Map preview skipped: MAP_RENDERER_URL is not configured")
            return None

        try:
            return save_bytes(
                self._render_map(postcard),
                MAP_FOLDER,
                extension=".webp",
            )
        except Exception:
            logger.exception(
                "Could not generate map preview for postcard %s", postcard.id
            )
            return None

    def _render_map(self, postcard: Postcard) -> bytes:
        shape = to_shape(postcard.coordinates)
        payload = json.dumps(
            {
                "center": {
                    "latitude": shape.y,
                    "longitude": shape.x,
                },
                "zoom": MAP_DEFAULT_ZOOM,
                "width": MAP_WIDTH,
                "height": MAP_HEIGHT,
            }
        ).encode()
        request = Request(
            f"{MAP_RENDERER_URL}/render",
            data=payload,
            headers={
                "Accept": "image/webp",
                "Content-Type": "application/json",
                "User-Agent": "MyMemories/1.0",
            },
            method="POST",
        )

        with urlopen(request, timeout=MAP_RENDERER_TIMEOUT) as response:
            if response.headers.get_content_type() != "image/webp":
                raise ValueError("Map renderer returned a non-WEBP response")
            return response.read()


map_preview_service = MapPreviewService()


def generate_map_preview(postcard: Postcard) -> str | None:
    """Generate a map preview using the application map preview service."""
    return map_preview_service.generate_map_preview(postcard)
