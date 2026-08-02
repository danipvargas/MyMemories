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

BASE_STORAGE_FOLDER = Path("/app/storage/images")

PROFILE_FOLDER = BASE_STORAGE_FOLDER / "profiles"
POSTCARD_FOLDER = BASE_STORAGE_FOLDER / "postcards"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Uploaded file limits
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_PIXELS = 50_000_000  # 50 MP

# Stored image configuration
PROFILE_SIZE = 512
POSTCARD_MAX_DIMENSION = 2500

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

    img = resize_to_fit(
        img,
        POSTCARD_MAX_DIMENSION,
    )

    return save_image(
        img,
        POSTCARD_FOLDER,
    )


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
    img.thumbnail(
        (max_dimension, max_dimension),
        Image.Resampling.LANCZOS,
    )

    return img


def generate_filename() -> str:
    return f"{uuid4()}.jpg"


def save_image(
    img: Image.Image,
    destination: Path,
) -> str:
    destination.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = generate_filename()

    filepath = destination / filename

    quality = DEFAULT_JPEG_QUALITY

    while quality >= MIN_JPEG_QUALITY:
        buffer = BytesIO()

        img.save(
            buffer,
            format="JPEG",
            optimize=True,
            quality=quality,
        )

        if buffer.tell() <= TARGET_IMAGE_SIZE:
            break

        quality -= 5

    with open(filepath, "wb") as file:
        file.write(buffer.getvalue())

    return str(filepath.relative_to(BASE_STORAGE_FOLDER))


def delete_image(relative_path: str):
    filepath = BASE_STORAGE_FOLDER / relative_path

    if filepath.exists():
        filepath.unlink()
