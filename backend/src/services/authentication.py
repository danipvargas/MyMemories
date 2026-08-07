from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from src.config import AUTH_SECRET_KEY, AUTH_TOKEN_MAX_AGE
from src.database import get_db
from src.models.user import User
from src.repository.user import (
    get_user_by_id,
    get_user_by_identifier,
    get_user_password_hash,
)

password_hasher = PasswordHash.recommended()
AUTH_ALGORITHM = "HS256"
AUTH_COOKIE_NAME = "access_token"


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


def authenticate_user(db: Session, identifier: str, password: str) -> User | None:
    """Return the matching user when an identifier and password are valid."""
    user = get_user_by_identifier(db=db, identifier=identifier.strip())
    if user is None or not password_hasher.verify(password, user.password_hash):
        return None
    return user


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(UTC) + timedelta(seconds=AUTH_TOKEN_MAX_AGE)
    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        AUTH_SECRET_KEY,
        algorithm=AUTH_ALGORITHM,
    )


def get_current_user(
    db: Session = Depends(get_db),
    access_token: str | None = Cookie(default=None, alias=AUTH_COOKIE_NAME),
) -> User:
    """Resolve the authenticated user from the HTTP-only session cookie."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication is required.",
    )

    if access_token is None:
        raise credentials_error

    try:
        payload = jwt.decode(
            access_token,
            AUTH_SECRET_KEY,
            algorithms=[AUTH_ALGORITHM],
        )
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as error:
        raise credentials_error from error

    user = get_user_by_id(db=db, user_id=user_id)
    if user is None:
        raise credentials_error

    return user
