from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base

if TYPE_CHECKING:
    from src.models.postcard import Postcard


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    username: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    email: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)

    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    profile_image_path: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )

    postcards: Mapped[list["Postcard"]] = relationship(back_populates="user")
