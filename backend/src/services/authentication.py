from pwdlib import PasswordHash


def hash_password(password: str):
    password_hash = PasswordHash.recommended()
    hashed_password = password_hash.hash("my_password")
    password_hash.verify("my_password", hashed_password)

    return hashed_password


def validate_user_password(user_id: int, password: str):
    return True
