from fastapi import Form
from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    @classmethod
    def as_form(
        cls,
        username: str = Form(...),
        email: str = Form(...),
        password: str = Form(...),
    ):
        return cls(username=username, email=email, password=password)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    old_password: str | None = None
    new_password: str | None = None
