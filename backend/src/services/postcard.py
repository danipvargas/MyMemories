from fastapi import UploadFile
from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session

from src.exceptions.postcard import PostcardNotFoundException
from src.exceptions.user import UserNotFoundException
from src.models.postcard import Postcard
from src.repository.postcard import create_postcard as repository_create_postcard
from src.repository.postcard import delete_postcard as repository_delete_postcard
from src.repository.postcard import get_postcard_by_id as repository_get_postcard_by_id
from src.repository.postcard import get_postcards as repository_get_postcards
from src.repository.postcard import update_postcard as repository_update_postcard
from src.repository.user import exists_user_by_id
from src.schemas.postcard import PostcardCreate, PostcardResponse, PostcardUpdate
from src.services.image import process_and_save_postcard


def __convert_db_postcard_to_response__(db_postcard: Postcard):
    point = to_shape(db_postcard.coordinates)

    return PostcardResponse(
        id=db_postcard.id,
        user_id=db_postcard.user_id,
        image_path=db_postcard.image_path,
        adquisition_date=db_postcard.adquisition_date,
        adquisition_date_precision=db_postcard.adquisition_date_precision,
        country=db_postcard.country,
        city=db_postcard.city,
        region=db_postcard.region,
        coordinates=(point.y, point.x),
        description=db_postcard.description,
    )


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

    return __convert_db_postcard_to_response__(
        repository_create_postcard(
            db=db,
            new_postcard=new_postcard,
            postcard_image_path=image_path,
        )
    )


def get_postcards(
    db: Session,
):
    return [
        __convert_db_postcard_to_response__(dbp)
        for dbp in repository_get_postcards(db=db)
    ]


def get_postcard_by_id(db: Session, postcard_id: int):
    return __convert_db_postcard_to_response__(
        repository_get_postcard_by_id(db=db, postcard_id=postcard_id)
    )


def delete_postcard(db: Session, postcard_id: int):
    deleted_postcard = repository_delete_postcard(db=db, postcard_id=postcard_id)

    if not deleted_postcard:
        raise PostcardNotFoundException()

    return __convert_db_postcard_to_response__(deleted_postcard)


def update_postcard(
    db: Session,
    postcard_id: int,
    modified_fields: PostcardUpdate,
    new_postcard_image: UploadFile | None = None,
):
    postcard = repository_get_postcard_by_id(db=db, postcard_id=postcard_id)

    if postcard is None:
        raise UserNotFoundException()

    update_data = modified_fields.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    postcard_image_path = None

    if new_postcard_image is not None:
        postcard_image_path = process_and_save_postcard(image=new_postcard_image)

    return __convert_db_postcard_to_response__(
        repository_update_postcard(
            db=db,
            postcard=postcard,
            update_data=update_data,
            new_postcard_image_path=postcard_image_path,
        )
    )
