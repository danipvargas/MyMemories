from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.crud.user import create_user, delete_user_by_id, get_users, update_user
from app.database import Base, engine, get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.post("/users", response_model=UserResponse)
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@app.get("/users", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return get_users(db)


@app.delete("/users/{user_id}", response_model=UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return delete_user_by_id(db, user_id=user_id)


@app.patch("/users/{user_id}", response_model=UserResponse)
def patch_user(
    user_id: int, modified_fields: UserUpdate, db: Session = Depends(get_db)
):
    return update_user(db, user_id=user_id, modified_fields=modified_fields)
