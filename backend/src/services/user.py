from fastapi import UploadFile
from sqlalchemy.orm import Session

from src.exceptions.user import (
    EmailAlreadyRegistered,
    NotMatchingPasswordException,
    UsernameAlreadyExists,
    UserNotFoundException,
)
from src.models.user import User
from src.repository.user import (
    create_user as repository_create_user,
)
from src.repository.user import (
    delete_user as repository_delete_user,
)
from src.repository.user import (
    exists_email,
    exists_username,
)
from src.repository.user import (
    get_user_by_id as repository_get_user_by_id,
)
from src.repository.user import get_users as repository_get_users
from src.repository.user import update_user as repository_update_user
from src.schemas.user import UserCreate, UserResponse, UserUpdate
from src.services.authentication import hash_password, validate_user_password
from src.services.image import delete_image, process_and_save_profile_pic


def _to_user_response_(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


def create_user(
    db: Session,
    new_user: UserCreate,
    profile_image: UploadFile,
) -> UserResponse:
    """
    Create a new user.

    Args:
        db: Active database session.
        new_user: Data used to create the user.
        profile_image: Uploaded profile image.

    Returns:
        The created user.

    Raises:
        UsernameAlreadyExists: If the username is already in use.
        EmailAlreadyRegistered: If the email address is already registered.
        sqlalchemy.exc.SQLAlchemyError: If the database operation fails.
    """
    if exists_username(db, new_user.username):
        raise UsernameAlreadyExists()

    if exists_email(db, new_user.email):
        raise EmailAlreadyRegistered()

    image_path = process_and_save_profile_pic(profile_image)
    new_user.password = hash_password(new_user.password)

    return _to_user_response_(
        repository_create_user(
            db=db,
            new_user=new_user,
            profile_image_path=image_path,
        )
    )


def get_users(
    db: Session,
) -> list[UserResponse]:
    """
    Retrieve all users.

    Args:
        db: Active database session.

    Returns:
        A list containing all users.

    Raises:
        sqlalchemy.exc.SQLAlchemyError: If the database query fails.
    """
    return [_to_user_response_(dbu) for dbu in repository_get_users(db=db)]


def get_user_by_id(db: Session, user_id: int) -> UserResponse:
    """
    Retrieve an user by its identifier.

    Args:
        db: Active database session.
        user_id: Identifier of the user to retrieve.

    Returns:
        The requested user.

    Raises:
        UserNotFoundException: If no user with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database query fails.
    """
    db_user = repository_get_user_by_id(db=db, user_id=user_id)

    if not db_user:
        raise UserNotFoundException()

    return _to_user_response_(db_user)


def get_user_profile_pic_path(db: Session, user_id: int) -> str:
    """
    Retrieve an user profile pic path by its identifier.

    Args:
        db: Active database session.
        user_id: Identifier of the user whose profile pic path to retrieve.

    Returns:
        The requested user profile pic path, if exists.

    Raises:
        PostcardNotFoundException: If no user with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database query fails.
    """
    user = repository_get_user_by_id(db=db, user_id=user_id)

    if not user:
        raise UserNotFoundException()

    return user.profile_image_path


def delete_user_by_id(db: Session, user_id: int) -> UserResponse:
    """
    Delete a user by its identifier.

    Args:
        db: Active database session.
        user_id: Identifier of the user to delete.

    Returns:
        The deleted user.

    Raises:
        UserNotFoundException: If no user with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database operation fails.
    """
    deleted_user = repository_delete_user(db=db, user_id=user_id)

    if not deleted_user:
        raise UserNotFoundException()

    delete_image(relative_path=deleted_user.profile_image_path)

    return _to_user_response_(deleted_user)


def update_user(
    db: Session,
    user_id: int,
    modified_fields: UserUpdate,
    new_profile_pic: UploadFile | None = None,
) -> UserResponse:
    """
    Update an existing user.

    Args:
        db: Active database session.
        user_id: Identifier of the user to update.
        modified_fields: Fields to update.
        new_profile_pic: New profile image, if provided.

    Returns:
        The updated user.

    Raises:
        UserNotFoundException: If no user with the given identifier exists.
        UsernameAlreadyExists: If the new username is already in use.
        EmailAlreadyRegistered: If the new email address is already registered.
        NotMatchingPasswordException: If the current password is missing or incorrect.
        sqlalchemy.exc.SQLAlchemyError: If the database operation fails.
    """
    user = repository_get_user_by_id(db=db, user_id=user_id)

    if user is None:
        raise UserNotFoundException()

    if (
        modified_fields.username is not None
        and modified_fields.username != user.username
        and exists_username(db, modified_fields.username)
    ):
        raise UsernameAlreadyExists()

    if (
        modified_fields.email is not None
        and modified_fields.email != user.email
        and exists_email(db, modified_fields.email)
    ):
        raise EmailAlreadyRegistered()

    update_data = modified_fields.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    if "new_password" in update_data:
        if modified_fields.old_password is None:
            raise NotMatchingPasswordException()

        if not validate_user_password(
            db=db,
            user_id=user_id,
            password=modified_fields.old_password,
        ):
            raise NotMatchingPasswordException()

        update_data["password_hash"] = hash_password(modified_fields.new_password)

    update_data.pop("old_password", None)
    update_data.pop("new_password", None)

    if new_profile_pic is not None:
        new_profile_image_path = process_and_save_profile_pic(image=new_profile_pic)
    else:
        new_profile_image_path = None

    updated_user = repository_update_user(
        db=db,
        user=user,
        update_data=update_data,
        new_profile_pic_path=new_profile_image_path,
    )

    if new_profile_image_path is not None:
        delete_image(relative_path=user.profile_image_path)

    return _to_user_response_(updated_user)
