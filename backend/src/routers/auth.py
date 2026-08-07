from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.config import AUTH_COOKIE_SAMESITE, AUTH_COOKIE_SECURE, AUTH_TOKEN_MAX_AGE
from src.database import get_db
from src.schemas.user import LoginRequest, UserResponse
from src.services.authentication import (
    AUTH_COOKIE_NAME,
    authenticate_user,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse)
def login(credentials: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(
        db=db,
        identifier=credentials.identifier,
        password=credentials.password,
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username, email or password.",
        )

    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=create_access_token(user.id),
        max_age=AUTH_TOKEN_MAX_AGE,
        httponly=True,
        secure=AUTH_COOKIE_SECURE,
        samesite=AUTH_COOKIE_SAMESITE,
    )
    return user


@router.get("/me", response_model=UserResponse)
def current_user(user=Depends(get_current_user)):
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(key=AUTH_COOKIE_NAME)
