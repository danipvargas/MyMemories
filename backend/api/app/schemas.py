from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str
    password_hash: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}
