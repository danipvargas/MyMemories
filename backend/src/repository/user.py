from typing import Any

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from src.models.user import User
from src.schemas.user import UserCreate


def create_user(db: Session, new_user: UserCreate, profile_image_path: str) -> User:
    """
    Create a new user and store it in the database.

    Args:
        db: Active database session.
        new_user: Data used to create the user.
        profile_image_path: Path where the user's profile image is stored.

    Returns:
        The newly created user.
    """
    db_user = User(
        username=new_user.username,
        email=new_user.email,
        password_hash=new_user.password,
        profile_image_path=profile_image_path,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: int) -> User | None:
    """
    Delete a user from the database by its identifier.

    Args:
        db: Active database session.
        user_id: Identifier of the user to delete.

    Returns:
        The deleted user if it exists, otherwise None.
    """
    user = db.get(User, user_id)

    if user is None:
        return None

    db.delete(user)
    db.commit()

    return user


def update_user(
    db: Session,
    user: User,
    update_data: dict[str, Any],
    new_profile_pic_path: str | None = None,
) -> User:
    """
    Update the fields of an existing user.

    Args:
        db: Active database session.
        user: User instance to update.
        update_data: Dictionary containing the fields and values to update.
        new_profile_pic_path: New profile image path to assign to the user, if provided.

    Returns:
        The updated user.
    """
    for field, value in update_data.items():
        setattr(user, field, value)

    if new_profile_pic_path is not None:
        user.profile_image_path = new_profile_pic_path

    db.commit()
    db.refresh(user)

    return user


def get_users(db: Session) -> list[User]:
    """
    Retrieve all users from the database.

    Args:
        db: Active database session.

    Returns:
        A list containing all stored users.
    """
    return db.query(User).all()


def get_user_by_id(db: Session, user_id: int) -> User:
    """
    Retrieve a user by its identifier.

    Args:
        db: Active database session.
        user_id: Identifier of the user to retrieve.

    Returns:
        The matching user if found, otherwise None.
    """
    return db.get(User, user_id)


def exists_user_by_id(db: Session, user_id: int) -> bool:
    """
    Check whether a user with the given identifier exists.

    Args:
        db: Active database session.
        user_id: Identifier of the user to check.

    Returns:
        True if the user exists, otherwise False.
    """
    stmt = select(exists().where(User.id == user_id))
    return db.scalar(stmt)


def exists_username(db: Session, username: str) -> bool:
    """
    Check whether a username is already in use.

    Args:
        db: Active database session.
        username: Username to check.

    Returns:
        True if the username exists, otherwise False.
    """
    stmt = select(exists().where(User.username == username))
    return db.scalar(stmt)


def exists_email(db: Session, email: str) -> bool:
    """
    Check whether an email address is already in use.

    Args:
        db: Active database session.
        email: Email address to check.

    Returns:
        True if the email exists, otherwise False.
    """
    stmt = select(exists().where(User.email == email))
    return db.scalar(stmt)


def get_user_password_hash(db: Session, user_id: int) -> str | None:
    """
    Retrieve the password hash of a user.

    Args:
        db: Active database session.
        user_id: Identifier of the user.

    Returns:
        The password hash of the user if found, otherwise None.
    """
    stmt = select(User.password_hash).where(User.id == user_id)

    return db.scalar(stmt)
