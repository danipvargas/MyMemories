import json
from types import SimpleNamespace
from unittest.mock import MagicMock, Mock, patch

from geoalchemy2.elements import WKTElement

from src.services import map_preview


def test_renderer_request_contains_postcard_coordinates():
    response = Mock()
    response.headers.get_content_type.return_value = "image/webp"
    response.read.return_value = b"rendered-webp"

    response_context = MagicMock()
    response_context.__enter__.return_value = response
    response_context.__exit__.return_value = None

    postcard = SimpleNamespace(
        id=3,
        coordinates=WKTElement("POINT(-0.3763 39.4699)", srid=4326),
    )

    with (
        patch.object(map_preview, "MAP_RENDERER_URL", "http://map-renderer:8080"),
        patch.object(map_preview, "MAP_DEFAULT_ZOOM", 10),
        patch.object(map_preview, "MAP_WIDTH", 600),
        patch.object(map_preview, "MAP_HEIGHT", 400),
        patch.object(map_preview, "urlopen", return_value=response_context) as request,
    ):
        result = map_preview.MapPreviewService()._render_map(postcard)

    sent_request = request.call_args.args[0]
    assert sent_request.full_url == "http://map-renderer:8080/render"
    assert sent_request.method == "POST"
    assert json.loads(sent_request.data) == {
        "center": {"latitude": 39.4699, "longitude": -0.3763},
        "zoom": 10,
        "width": 600,
        "height": 400,
    }
    assert result == b"rendered-webp"
