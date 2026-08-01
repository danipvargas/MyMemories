class MyMemoriesError(Exception):
    """Base exception for all application errors."""

    default_message = "An unexpected error occurred."

    def __init__(self, message: str | None = None):
        self.message = message or self.default_message
        super().__init__(self.message)
