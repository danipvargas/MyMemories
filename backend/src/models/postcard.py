from datetime import date
from enum import Enum
from typing import TYPE_CHECKING

from geoalchemy2 import Geography
from geoalchemy2.elements import WKBElement
from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base

if TYPE_CHECKING:
    from src.models.user import User


class DatePrecision(Enum):
    DAY = "day"
    MONTH = "month"
    YEAR = "year"
    UNKNOWN = "unknown"


class Postcard(Base):
    __tablename__ = "postcards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="postcards")

    image_path: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)

    thumbnail_path: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)

    title: Mapped[str] = mapped_column(String(60), unique=False, nullable=False)

    adquisition_date: Mapped[date] = mapped_column(Date, nullable=False)

    adquisition_date_precision: Mapped[DatePrecision] = mapped_column(
        SQLEnum(DatePrecision), nullable=False
    )

    country: Mapped[str] = mapped_column(String(50), nullable=False)

    city: Mapped[str | None] = mapped_column(String(50), nullable=True)

    region: Mapped[str | None] = mapped_column(String(50), nullable=True)

    coordinates: Mapped[WKBElement] = mapped_column(
        Geography("POINT", srid=4326),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
