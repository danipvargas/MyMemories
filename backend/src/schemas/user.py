from fastapi import Form
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @classmethod
    def as_form(
        cls,
        username: str = Form(...),
        email: EmailStr = Form(...),
        password: str = Form(...),
    ):
        return cls(username=username, email=email, password=password)


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    old_password: str | None = None
    new_password: str | None = None

    @classmethod
    def as_form(
        cls,
        username: str | None = Form(None),
        email: EmailStr | None = Form(None),
        old_password: str | None = Form(None),
        new_password: str | None = Form(None),
    ):
        return cls(
            username=username,
            email=email,
            old_password=old_password,
            new_password=new_password,
        )
