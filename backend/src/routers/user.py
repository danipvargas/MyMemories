from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from src.database import get_db
from src.repository.user import create_user, delete_user_by_id, get_users
from src.schemas.user import UserCreate, UserResponse
from src.services.authentication import hash_password
from src.services.image import process_and_save_profile_pic

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse)
def add_user(
    user: UserCreate = Depends(UserCreate.as_form),
    profile_image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    hashed_password = hash_password(user.password)
    user.password = hashed_password

    image_path = process_and_save_profile_pic(image=profile_image)

    return create_user(db, user, profile_image_path=image_path)


@router.get("/", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return get_users(db)


@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return delete_user_by_id(db, user_id=user_id)


# @router.patch("/{user_id}", response_model=UserResponse)
#     try:
#         return user_service.update_user(
#             db=db,
#             user_id=user_id,
#             modified_fields=modified_fields,
#         )
#     except InvalidPasswordError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Current password is incorrect.",
#         )
#     except UserNotFoundError:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found.",
#         )
