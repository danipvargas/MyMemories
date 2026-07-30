from sqlalchemy.orm import Session

from app.models import User
from app.schemas import UserCreate


def create_user(db: Session, user: UserCreate):
    db_user = User(
        username=user.username, email=user.email, password_hash=user.password_hash
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_users(db: Session):
    return db.query(User).all()
