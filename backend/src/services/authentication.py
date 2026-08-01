from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from src.repository.user import get_user_password_hash


def hash_password(password: str):
    password_hash = PasswordHash.recommended()
    hashed_password = password_hash.hash(password=password)

    return hashed_password


def validate_user_password(db: Session, user_id: int, password: str):
    password_hash = PasswordHash.recommended()
    user_current_hash = get_user_password_hash(db=db, user_id=user_id)

    return password_hash.verify(password=password, hash=user_current_hash)
