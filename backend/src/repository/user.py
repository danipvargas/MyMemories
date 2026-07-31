from sqlalchemy.orm import Session

from src.models.user import User
from src.schemas.user import UserCreate, UserUpdate


def create_user(db: Session, new_user: UserCreate):
    db_user = User(
        username=new_user.username,
        email=new_user.email,
        password_hash=new_user.password_hash,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user_by_id(db: Session, user_id: int):
    user = db.get(User, user_id)

    if user is None:
        return None

    db.delete(user)
    db.commit()

    return user


def update_user(db: Session, user_id: int, modified_fields: UserUpdate):
    user = db.get(User, user_id)

    if user is None:
        return None

    update_data = modified_fields.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field != "id":
            setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user


def get_users(db: Session):
    return db.query(User).all()
