from io import BytesIO

from PIL import Image


def image_bytes() -> bytes:
    """Return a tiny valid PNG for upload tests."""
    buffer = BytesIO()
    Image.new("RGB", (2, 2), color=(76, 106, 146)).save(buffer, format="PNG")
    return buffer.getvalue()


def postcard_files() -> dict[str, tuple[str, bytes, str]]:
    return {
        "postcard_image": ("postcard.png", image_bytes(), "image/png"),
        "postcard_cover": ("cover.png", image_bytes(), "image/png"),
    }
