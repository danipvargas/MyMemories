from src.exceptions.base import MyMemoriesError


class PostcardNotFoundException(MyMemoriesError):
    status_code = 404
    default_message = "Given postcard not found in database."


class PostcardMapNotFoundException(MyMemoriesError):
    status_code = 404
    default_message = "Map preview not found for given postcard."


class InvalidPostcardCoordinatesException(MyMemoriesError):
    status_code = 400
    default_message = "Latitude and longitude must be provided together."
