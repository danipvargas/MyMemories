from src.exceptions.base import MyMemoriesError


class PostcardNotFoundException(MyMemoriesError):
    status_code = 404
    default_message = "Given postcard not found in database."
