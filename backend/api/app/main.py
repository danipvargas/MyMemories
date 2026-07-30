from fastapi import Depends
from fastapi import FastAPI
from sqlalchemy.orm import Session

from app.database import Base
from app.database import engine
from app.database import get_db

from app.schemas import UserCreate
from app.schemas import UserResponse

from app.crud import create_user
from app.crud import get_users

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.post("/users", response_model=UserResponse)
def add_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(db, user)


@app.get("/users", response_model=list[UserResponse])
def read_users(
    db: Session = Depends(get_db)
):
    return get_users(db)