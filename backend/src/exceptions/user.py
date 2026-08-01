from src.exceptions.base import MyMemoriesError


class NotMatchingPasswordException(MyMemoriesError):
    status_code = 401
    default_message = "The provided password is not correct."


class UserNotFoundException(MyMemoriesError):
    status_code = 404
    default_message = "Given user not found in database."


class UsernameAlreadyExists(MyMemoriesError):
    status_code = 409
    default_message = "Given username already exists."


class EmailAlreadyRegistered(MyMemoriesError):
    status_code = 409
    default_message = "Given email is already registered."
