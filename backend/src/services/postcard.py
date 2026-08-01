from fastapi import UploadFile
from sqlalchemy.orm import Session

from src.exceptions.postcard import PostcardNotFoundException
from src.exceptions.user import UserNotFoundException
from src.repository.postcard import create_postcard as repository_create_postcard
from src.repository.postcard import delete_postcard as repository_delete_postcard
from src.repository.postcard import get_postcard_by_id as repository_get_postcard_by_id
from src.repository.postcard import get_postcards as repository_get_postcards
from src.repository.user import exists_user_by_id
from src.schemas.postcard import PostcardCreate
from src.services.image import process_and_save_postcard


def create_postcard(
    db: Session,
    new_postcard: PostcardCreate,
    postcard_image: UploadFile,
):
    if not exists_user_by_id(db=db, user_id=new_postcard.user_id):
        raise UserNotFoundException(
            f"No user with user_id={new_postcard.user_id} found."
        )

    image_path = process_and_save_postcard(postcard_image)

    return repository_create_postcard(
        db=db,
        new_postcard=new_postcard,
        postcard_image_path=image_path,
    )


def get_postcards(
    db: Session,
):
    return repository_get_postcards(db=db)


def get_postcard_by_id(db: Session, postcard_id: int):
    return repository_get_postcard_by_id(db=db, postcard_id=postcard_id)


def delete_postcard(db: Session, postcard_id: int):
    deleted_postcard = repository_delete_postcard(db=db, postcard_id=postcard_id)

    if not deleted_postcard:
        raise PostcardNotFoundException()

    return deleted_postcard


# def update_user(
#     db: Session,
#     user_id: int,
#     modified_fields: UserUpdate,
#     new_profile_pic: UploadFile | None = None,
# ):
#     user = get_user_by_id(db=db, user_id=user_id)

#     if user is None:
#         raise UserNotFoundException()

#     if (
#         modified_fields.username is not None
#         and modified_fields.username != user.username
#         and exists_username(db, modified_fields.username)
#     ):
#         raise UsernameAlreadyExists()

#     if (
#         modified_fields.email is not None
#         and modified_fields.email != user.email
#         and exists_email(db, modified_fields.email)
#     ):
#         raise EmailAlreadyRegistered()

#     update_data = modified_fields.model_dump(
#         exclude_unset=True,
#         exclude_none=True,
#     )

#     if "new_password" in update_data:
#         if modified_fields.old_password is None:
#             raise NotMatchingPasswordException()

#         if not validate_user_password(
#             db=db,
#             user_id=user_id,
#             password=modified_fields.old_password,
#         ):
#             raise NotMatchingPasswordException()

#         update_data["password_hash"] = hash_password(modified_fields.new_password)

#     update_data.pop("old_password", None)
#     update_data.pop("new_password", None)

#     profile_image_path = None

#     if new_profile_pic is not None:
#         profile_image_path = process_and_save_profile_pic(image=new_profile_pic)

#     return repository_update_user(
#         db=db,
#         user=user,
#         update_data=update_data,
#         new_profile_pic_path=profile_image_path,
#     )
