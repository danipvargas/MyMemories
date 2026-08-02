from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas.user import UserCreate, UserResponse, UserUpdate
from src.services.image import BASE_STORAGE_FOLDER
from src.services.user import (
    create_user,
    delete_user_by_id,
    get_user_by_id,
    get_user_profile_pic_path,
    get_users,
    update_user,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description=(
        "Creates a new user account, hashes the provided password and stores "
        "the uploaded profile picture."
    ),
    responses={
        201: {"description": "User successfully created."},
        400: {"description": "Invalid user data."},
        409: {"description": "Username or email already exists."},
        415: {"description": "Unsupported image format."},
        500: {"description": "Unexpected server error."},
    },
)
def add_user(
    user: UserCreate = Depends(UserCreate.as_form),
    profile_image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return create_user(db=db, new_user=user, profile_image=profile_image)


@router.get(
    "/",
    response_model=list[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List all users",
    description=("Lists all existing users in the database."),
    responses={
        200: {"description": "Users successfully listed."},
        500: {"description": "Unexpected server error."},
    },
)
def read_users(db: Session = Depends(get_db)):
    return get_users(db)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve use by id",
    description=("Retrieve the unique existing user with the given id, if exists"),
    responses={
        200: {"description": "User successfully retrieved."},
        404: {"description": "User not found"},
        500: {"description": "Unexpected server error."},
    },
)
def retrieve_user_by_id(user_id: int, db: Session = Depends(get_db)):
    return get_user_by_id(user_id=user_id, db=db)


@router.get(
    "/{user_id}/profile-pic",
    status_code=status.HTTP_200_OK,
    summary="Download user profile picture.",
    description=("Download user profile image using the path stored on the database."),
    responses={
        200: {"description": "User profile picture successfully deleted."},
        404: {"description": "User or profile picture not found"},
        500: {"description": "Unexpected server error."},
    },
)
def get_profile_pic(user_id: int, db: Session = Depends(get_db)):
    profile_pic_path = get_user_profile_pic_path(db=db, user_id=user_id)

    return FileResponse(
        BASE_STORAGE_FOLDER / profile_pic_path,
        media_type="image/jpeg",
    )


@router.delete(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete user by id",
    description=("Deletes, if exist, the user with the provided id. "),
    responses={
        200: {"description": "User successfully deleted."},
        404: {"description": "User not found"},
        500: {"description": "Unexpected server error."},
    },
)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return delete_user_by_id(db, user_id=user_id)


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user information",
    description=(
        "Updates, if exist, the information of the user with the provided id."
    ),
    responses={
        200: {"description": "User successfully updated."},
        400: {"description": "Invalid user data."},
        404: {"description": "User not found"},
        409: {"description": "Username or email already exists."},
        415: {"description": "Unsupported image format."},
        500: {"description": "Unexpected server error."},
    },
)
def patch_user(
    user_id: int,
    modified_fields: UserUpdate = Depends(UserUpdate.as_form),
    profile_image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    return update_user(
        db=db,
        user_id=user_id,
        modified_fields=modified_fields,
        new_profile_pic=profile_image,
    )
