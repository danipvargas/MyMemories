from typing import Any

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from src.models.user import User
from src.schemas.user import UserCreate


def create_user(db: Session, new_user: UserCreate, profile_image_path: str):
    db_user = User(
        username=new_user.username,
        email=new_user.email,
        password_hash=new_user.password,
        profile_image_path=profile_image_path,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: int):
    user = db.get(User, user_id)

    if user is None:
        return None

    db.delete(user)
    db.commit()

    return user


def update_user(
    db: Session,
    user: User,
    update_data: dict[str, Any],
    new_profile_pic_path: str | None = None,
) -> User:
    for field, value in update_data.items():
        setattr(user, field, value)

    if new_profile_pic_path is not None:
        user.profile_image_path = new_profile_pic_path

    db.commit()
    db.refresh(user)

    return user


def get_users(db: Session):
    return db.query(User).all()


def get_user_by_id(db: Session, user_id: int):
    return db.get(User, user_id)


def exists_user_by_id(db: Session, user_id: int):
    stmt = select(exists().where(User.id == user_id))
    return db.scalar(stmt)


def exists_username(db: Session, username: str):
    stmt = select(exists().where(User.username == username))
    return db.scalar(stmt)


def exists_email(db: Session, email: str):
    stmt = select(exists().where(User.email == email))
    return db.scalar(stmt)


def get_user_password_hash(db: Session, user_id: int):
    stmt = select(User.password_hash).where(User.id == user_id)

    return db.scalar(stmt)
