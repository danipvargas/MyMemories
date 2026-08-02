from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas.base import Pagination
from src.schemas.postcard import (
    PostcardCreate,
    PostcardFilters,
    PostcardResponse,
    PostcardUpdate,
    SortOptions,
)
from src.services.postcard import (
    create_postcard,
    delete_postcard,
    get_postcard_by_id,
    get_postcards,
    update_postcard,
)

router = APIRouter(prefix="/postcards", tags=["Postcards"])


@router.post(
    "/",
    response_model=PostcardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new postcard",
    description=(
        "Creates a new postcard item, processing the given coordinates and stores "
        "the uploaded profile picture."
    ),
    responses={
        201: {"description": "Postcard successfully created."},
        400: {"description": "Invalid postcard data."},
        404: {"description": "No found user with given user_id."},
        415: {"description": "Unsupported image format."},
        500: {"description": "Unexpected server error."},
    },
)
def add_postcard(
    new_postcard: PostcardCreate = Depends(PostcardCreate.as_form),
    postcard_image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return create_postcard(
        db=db, new_postcard=new_postcard, postcard_image=postcard_image
    )


@router.get(
    "/",
    response_model=list[PostcardResponse],
    status_code=status.HTTP_200_OK,
    summary="List all postcards matching the given filters",
    description=(
        "Lists all existing postcards in the database matching the given filters."
    ),
    responses={
        200: {"description": "Postcards successfully listed."},
        500: {"description": "Unexpected server error."},
    },
)
def read_postcards(
    filters: Annotated[PostcardFilters, Depends()],
    sorting: Annotated[SortOptions, Depends()],
    pagination: Annotated[Pagination, Depends()],
    db: Session = Depends(get_db),
):
    return get_postcards(db, filters=filters, sorting=sorting, pagination=pagination)


@router.get(
    "/{postcard_id}",
    response_model=PostcardResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve postcard by id",
    description=("Retrieve the unique existing postcard with the given id, if exists"),
    responses={
        200: {"description": "Postcard successfully retrieved."},
        404: {"description": "Postcard not found"},
        500: {"description": "Unexpected server error."},
    },
)
def retrieve_postcard_by_id(postcard_id: int, db: Session = Depends(get_db)):
    return get_postcard_by_id(postcard_id=postcard_id, db=db)


@router.delete(
    "/{postcard_id}",
    response_model=PostcardResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete postcard by id",
    description=("Deletes, if exist, the postcard with the provided id. "),
    responses={
        200: {"description": "Postcard successfully deleted."},
        404: {"description": "Postcard not found"},
        500: {"description": "Unexpected server error."},
    },
)
def delete_postcard_by_id(postcard_id: int, db: Session = Depends(get_db)):
    return delete_postcard(db, postcard_id=postcard_id)


@router.patch(
    "/{postcard_id}",
    response_model=PostcardResponse,
    status_code=status.HTTP_200_OK,
    summary="Update postcard information",
    description=(
        "Updates, if exist, the information of the postcard with the provided id."
    ),
    responses={
        200: {"description": "Postcard successfully updated."},
        400: {"description": "Invalid postcard data."},
        404: {"description": "Postcard not found"},
        415: {"description": "Unsupported image format."},
        500: {"description": "Unexpected server error."},
    },
)
def patch_postcard(
    postcard_id: int,
    modified_fields: PostcardUpdate = Depends(PostcardUpdate.as_form),
    postcard_image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    return update_postcard(
        db=db,
        postcard_id=postcard_id,
        modified_fields=modified_fields,
        new_postcard_image=postcard_image,
    )
