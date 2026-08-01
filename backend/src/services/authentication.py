from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from src.repository.user import get_user_password_hash

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Generate a secure hash for a plain-text password.

    Args:
        password: Plain-text password to hash.

    Returns:
        The hashed password.

    Raises:
        ValueError: If the password cannot be hashed.
    """
    hashed_password = password_hasher.hash(password=password)

    return hashed_password


def validate_user_password(db: Session, user_id: int, password: str) -> bool:
    """
    Validate whether a plain-text password matches the stored hash of a user.

    Args:
        db: Active database session.
        user_id: Identifier of the user whose password is being validated.
        password: Plain-text password to verify.

    Returns:
        True if the password matches the stored hash, otherwise False.

    Raises:
        sqlalchemy.exc.SQLAlchemyError: If the user's password hash cannot be retrieved.
        ValueError: If the password verification process fails.
    """
    user_current_hash = get_user_password_hash(db=db, user_id=user_id)

    return password_hasher.verify(password=password, hash=user_current_hash)
