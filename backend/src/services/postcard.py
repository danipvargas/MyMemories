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
from src.schemas.base import Pagination
from src.schemas.postcard import (
    PostcardCreate,
    PostcardFilters,
    PostcardResponse,
    PostcardUpdate,
    SortOptions,
)
from src.services.image import delete_image, process_and_save_postcard


def _to_postcard_response_(db_postcard: Postcard) -> PostcardResponse:
    """
    Convert a postcard database model into its response schema.

    Args:
        db_postcard: Database postcard instance to convert.

    Returns:
        A postcard response containing the postcard data.

    Raises:
        ValueError: If the postcard coordinates cannot be converted.
    """
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
) -> PostcardResponse:
    """
    Create a new postcard for an existing user.

    Args:
        db: Active database session.
        new_postcard: Data used to create the postcard.
        postcard_image: Uploaded postcard image.

    Returns:
        The created postcard.

    Raises:
        UserNotFoundException: If the specified user does not exist.
        sqlalchemy.exc.SQLAlchemyError: If the database operation fails.
    """
    if not exists_user_by_id(db=db, user_id=new_postcard.user_id):
        raise UserNotFoundException(
            f"No user with user_id={new_postcard.user_id} found."
        )

    image_path, thumbnail_path = process_and_save_postcard(postcard_image)

    return _to_postcard_response_(
        repository_create_postcard(
            db=db,
            new_postcard=new_postcard,
            postcard_image_path=image_path,
            thumbnail_path=thumbnail_path,
        )
    )


def get_postcards(
    db: Session, filters: PostcardFilters, sorting: SortOptions, pagination: Pagination
) -> list[PostcardResponse]:
    """
    Retrieve all stored postcards.

    Args:
        db: Active database session.
        filters: Different optional filters to select which postcards return.
        sorting: Parameter to set how to order the postcards.
        pagination: Pagination parameters.

    Returns:
        A list containing all postcards.

    Raises:
        sqlalchemy.exc.SQLAlchemyError: If the database query fails.
    """
    return [
        _to_postcard_response_(db_postcard)
        for db_postcard in repository_get_postcards(
            db=db, filters=filters, sorting=sorting, pagination=pagination
        )
    ]


def get_postcard_by_id(db: Session, postcard_id: int) -> PostcardResponse:
    """
    Retrieve a postcard by its identifier.

    Args:
        db: Active database session.
        postcard_id: Identifier of the postcard to retrieve.

    Returns:
        The requested postcard.

    Raises:
        PostcardNotFoundException: If no postcard with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database query fails.
    """
    db_postcard = repository_get_postcard_by_id(db=db, postcard_id=postcard_id)

    if not db_postcard:
        raise PostcardNotFoundException()

    return _to_postcard_response_(db_postcard)


def get_postcard_image_path(db: Session, postcard_id: int) -> str:
    """
    Retrieve a postcard image path by its identifier.

    Args:
        db: Active database session.
        postcard_id: Identifier of the postcard whose image to retrieve.

    Returns:
        The requested postcard image path, if exists.

    Raises:
        PostcardNotFoundException: If no postcard with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database query fails.
    """
    postcard = repository_get_postcard_by_id(db=db, postcard_id=postcard_id)

    if not postcard:
        raise PostcardNotFoundException()

    return postcard.image_path


def get_postcard_thumbnail_path(db: Session, postcard_id: int) -> str:
    """
    Retrieve a postcard thumbnail path by its identifier.

    Args:
        db: Active database session.
        postcard_id: Identifier of the postcard whose thumbnail to retrieve.

    Returns:
        The requested postcard thumbnail path, if exists.

    Raises:
        PostcardNotFoundException: If no postcard with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database query fails.
    """
    postcard = repository_get_postcard_by_id(db=db, postcard_id=postcard_id)

    if not postcard:
        raise PostcardNotFoundException()

    return postcard.thumbnail_path


def delete_postcard(db: Session, postcard_id: int) -> PostcardResponse:
    """
    Delete a postcard by its identifier.

    Args:
        db: Active database session.
        postcard_id: Identifier of the postcard to delete.

    Returns:
        The deleted postcard.

    Raises:
        PostcardNotFoundException: If no postcard with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database operation fails.
    """
    deleted_postcard = repository_delete_postcard(db=db, postcard_id=postcard_id)

    if not deleted_postcard:
        raise PostcardNotFoundException()

    delete_image(relative_path=delete_postcard.image_path)

    return _to_postcard_response_(deleted_postcard)


def update_postcard(
    db: Session,
    postcard_id: int,
    modified_fields: PostcardUpdate,
    new_postcard_image: UploadFile | None = None,
) -> PostcardResponse:
    """
    Update an existing postcard.

    Args:
        db: Active database session.
        postcard_id: Identifier of the postcard to update.
        modified_fields: Fields to update.
        new_postcard_image: New postcard image, if provided.

    Returns:
        The updated postcard.

    Raises:
        PostcardNotFoundException: If no postcard with the given identifier exists.
        sqlalchemy.exc.SQLAlchemyError: If the database operation fails.
    """
    postcard = repository_get_postcard_by_id(db=db, postcard_id=postcard_id)

    if postcard is None:
        raise PostcardNotFoundException()

    update_data = modified_fields.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )
    if new_postcard_image is not None:
        new_image_path = process_and_save_postcard(new_postcard_image)
    else:
        new_image_path = None

    updated_postcard = repository_update_postcard(
        db=db,
        postcard=postcard,
        update_data=update_data,
        new_postcard_image_path=new_image_path,
    )

    if new_image_path is not None:
        delete_image(postcard.image_path)

    return _to_postcard_response_(updated_postcard)
