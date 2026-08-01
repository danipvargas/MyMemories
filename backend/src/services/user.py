from fastapi import UploadFile
from sqlalchemy.orm import Session

from src.exceptions.user import (
    EmailAlreadyRegistered,
    NotMatchingPasswordException,
    UsernameAlreadyExists,
    UserNotFoundException,
)
from src.repository.user import (
    create_user as repository_create_user,
)
from src.repository.user import (
    delete_user as repository_delete_user,
)
from src.repository.user import (
    exists_email,
    exists_username,
    get_user_by_id,
)
from src.repository.user import get_users as repository_get_users
from src.repository.user import update_user as repository_update_user
from src.schemas.user import UserCreate, UserUpdate
from src.services.authentication import hash_password, validate_user_password
from src.services.image import process_and_save_profile_pic


def create_user(
    db: Session,
    new_user: UserCreate,
    profile_image: UploadFile,
):
    if exists_username(db, new_user.username):
        raise UsernameAlreadyExists()

    if exists_email(db, new_user.email):
        raise EmailAlreadyRegistered()

    image_path = process_and_save_profile_pic(profile_image)
    new_user.password = hash_password(new_user.password)

    return repository_create_user(
        db=db,
        new_user=new_user,
        profile_image_path=image_path,
    )


def get_users(
    db: Session,
):
    return repository_get_users(db=db)


def delete_user_by_id(db: Session, user_id: int):
    deleted_user = repository_delete_user(db=db, user_id=user_id)

    if not deleted_user:
        raise UserNotFoundException()

    return deleted_user


def update_user(
    db: Session,
    user_id: int,
    modified_fields: UserUpdate,
    new_profile_pic: UploadFile | None = None,
):
    user = get_user_by_id(db=db, user_id=user_id)

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

    profile_image_path = None

    if new_profile_pic is not None:
        profile_image_path = process_and_save_profile_pic(image=new_profile_pic)

    return repository_update_user(
        db=db,
        user=user,
        update_data=update_data,
        new_profile_pic_path=profile_image_path,
    )
