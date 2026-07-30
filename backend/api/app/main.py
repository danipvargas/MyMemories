from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.crud import create_user, get_users
from app.database import Base, engine, get_db
from app.schemas import UserCreate, UserResponse

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.post("/users", response_model=UserResponse)
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@app.get("/users", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return get_users(db)
