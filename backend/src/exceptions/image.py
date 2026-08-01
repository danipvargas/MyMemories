from src.exceptions.base import MyMemoriesError


class UnsupportedImageFormat(MyMemoriesError):
    status_code = 415
    default_message = "Format of given image is not supported."
