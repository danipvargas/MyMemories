from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from src.exceptions.image import (
    ImageTooLargeException,
    InvalidImageException,
    UnsupportedImageFormat,
)

STORAGE_ROOT = Path("/app/storage")
BASE_STORAGE_FOLDER = STORAGE_ROOT / "images"

PROFILE_FOLDER = BASE_STORAGE_FOLDER / "profiles"
POSTCARD_FOLDER = BASE_STORAGE_FOLDER / "postcards"
MAP_FOLDER = BASE_STORAGE_FOLDER / "maps"
COVER_FOLDER = BASE_STORAGE_FOLDER / "covers"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Uploaded file limits
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_PIXELS = 50_000_000  # 50 MP

# Stored image configuration
PROFILE_SIZE = 512
POSTCARD_MAX_DIMENSION = 2500
COVER_MAX_DIMENSION = 400

TARGET_IMAGE_SIZE = 500 * 1024  # 500 kB
MIN_JPEG_QUALITY = 60
DEFAULT_JPEG_QUALITY = 85


def process_and_save_profile_pic(image: UploadFile) -> str:
    img = load_image(image)

    img = crop_to_square(img)

    img = resize_to_fit(
        img,
        PROFILE_SIZE,
    )

    return save_image(
        img,
        PROFILE_FOLDER,
    )


def process_and_save_postcard(image: UploadFile) -> str:
    img = load_image(image)

    preview_img = resize_to_fit(
        img,
        POSTCARD_MAX_DIMENSION,
    )

    preview_path = save_image(
        preview_img,
        POSTCARD_FOLDER,
    )

    return preview_path


def process_and_save_cover(image: UploadFile) -> str:
    img = load_image(image)

    cover_img = resize_to_fit(
        img,
        COVER_MAX_DIMENSION,
    )

    cover_path = save_image(
        cover_img,
        COVER_FOLDER,
    )

    return cover_path


def load_image(upload: UploadFile) -> Image.Image:
    validate_extension(upload.filename)

    data = upload.file.read()

    validate_upload_size(data)

    try:
        img = Image.open(BytesIO(data))
        img.verify()

        img = Image.open(BytesIO(data))
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")

    except UnidentifiedImageError as err:
        raise InvalidImageException() from err

    validate_resolution(img)

    return img


def validate_extension(filename: str):
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise UnsupportedImageFormat()


def validate_upload_size(data: bytes):
    if len(data) > MAX_UPLOAD_SIZE:
        raise ImageTooLargeException()


def validate_resolution(img: Image.Image):
    width, height = img.size

    if width * height > MAX_PIXELS:
        raise ImageTooLargeException()


def crop_to_square(img: Image.Image) -> Image.Image:
    width, height = img.size

    side = min(width, height)

    left = (width - side) // 2
    top = (height - side) // 2

    return img.crop(
        (
            left,
            top,
            left + side,
            top + side,
        )
    )


def resize_to_fit(
    img: Image.Image,
    max_dimension: int,
) -> Image.Image:
    resized = img.copy()
    resized.thumbnail(
        (max_dimension, max_dimension),
        Image.Resampling.LANCZOS,
    )
    return resized


def generate_filename(extension: str = ".jpg") -> str:
    return f"{uuid4()}{extension}"


def save_image(
    img: Image.Image,
    destination: Path,
    image_format: str = "JPEG",
    extension: str = ".jpg",
    quality: int | None = None,
) -> str:
    destination.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = generate_filename(extension)

    filepath = destination / filename

    if quality is not None:
        buffer = BytesIO()
        img.save(
            buffer,
            format=image_format,
            optimize=True,
            quality=max(1, min(quality, 100)),
        )
    else:
        selected_quality = DEFAULT_JPEG_QUALITY

        while selected_quality >= MIN_JPEG_QUALITY:
            buffer = BytesIO()
            img.save(
                buffer,
                format=image_format,
                optimize=True,
                quality=selected_quality,
            )

            if buffer.tell() <= TARGET_IMAGE_SIZE:
                break

            selected_quality -= 5

    with open(filepath, "wb") as file:
        file.write(buffer.getvalue())

    return str(filepath.relative_to(BASE_STORAGE_FOLDER))


def save_bytes(
    data: bytes,
    destination: Path,
    extension: str = ".webp",
    relative_to: Path = BASE_STORAGE_FOLDER,
) -> str:
    """Persist generated binary media and return its storage-relative path."""
    destination.mkdir(
        parents=True,
        exist_ok=True,
    )

    filepath = destination / generate_filename(extension)
    filepath.write_bytes(data)

    return str(filepath.relative_to(relative_to))


def delete_image(relative_path: str):
    filepath = BASE_STORAGE_FOLDER / relative_path

    if filepath.exists():
        filepath.unlink()


def get_image(relative_path: str) -> Path:
    filepath = BASE_STORAGE_FOLDER / relative_path

    if not filepath.is_file():
        raise FileNotFoundError(relative_path)

    return filepath


def delete_map_image(relative_path: str):
    """Delete a map from the current or legacy map storage location."""
    try:
        get_map_image(relative_path).unlink()
    except FileNotFoundError:
        pass


def get_map_image(relative_path: str) -> Path:
    """Resolve a map path, including maps created before the storage move."""
    candidates = [STORAGE_ROOT / relative_path, BASE_STORAGE_FOLDER / relative_path]
    if relative_path.startswith("postcards/maps/"):
        candidates.append(MAP_FOLDER / Path(relative_path).name)

    for filepath in candidates:
        if filepath.is_file():
            return filepath

    raise FileNotFoundError(relative_path)
