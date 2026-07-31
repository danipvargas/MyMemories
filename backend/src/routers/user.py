from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.crud.user import create_user, delete_user_by_id, get_users, update_user
from src.database import get_db
from src.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse)
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.get("/", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return get_users(db)


@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return delete_user_by_id(db, user_id=user_id)


@router.patch("/{user_id}", response_model=UserResponse)
def patch_user(
    user_id: int, modified_fields: UserUpdate, db: Session = Depends(get_db)
):
    return update_user(db, user_id=user_id, modified_fields=modified_fields)
