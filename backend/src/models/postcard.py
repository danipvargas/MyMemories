from datetime import date
from enum import Enum

from geoalchemy2 import Geometry
from geoalchemy2.elements import WKBElement
from sqlalchemy import Date, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class DatePrecision(Enum):
    DAY = "day"
    MONTH = "month"
    YEAR = "year"
    UNKNOWN = "unknown"


class PostCard(Base):
    __tablename__ = "postcards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    image_path: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    adquisition_date: Mapped[date] = mapped_column(Date, nullable=False)

    adquisition_date_precision: Mapped[DatePrecision] = mapped_column(
        SQLEnum(DatePrecision), nullable=False
    )

    country: Mapped[str] = mapped_column(String(50), nullable=False)

    city: Mapped[str | None] = mapped_column(String(50), nullable=True)

    region: Mapped[str | None] = mapped_column(String(50), nullable=True)

    coordinates: Mapped[WKBElement] = mapped_column(
        Geometry("POINT", srid=4326),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
