from src.exceptions.base import MyMemoriesError


class UnsupportedImageFormat(MyMemoriesError):
    status_code = 415
    default_message = "Format of given image is not supported."


class InvalidImageException(MyMemoriesError):
    status_code = 422
    default_message = "Given image is not valid"


class ImageTooLargeException(MyMemoriesError):
    status_code = 413
    default_message = "Image exceeds the maximum allowed size."
