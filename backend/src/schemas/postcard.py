from datetime import date

from fastapi import Form
from pydantic import BaseModel

from src.models.postcard import DatePrecision


class PostcardResponse(BaseModel):
    image_path: str
    adquisition_date: date
    adquisition_date_precision: DatePrecision
    country: str
    city: str
    coordinates: tuple[float, float]
    region: str | None = None
    description: str | None = None


class PostcardCreate(BaseModel):
    adquisition_date: date
    adquisition_date_precision: DatePrecision
    country: str
    latitude: float
    longitude: float
    city: str | None = None
    region: str | None = None
    description: str | None = None

    @classmethod
    def as_form(
        cls,
        adquisition_date: date = Form(...),
        adquisition_date_precision: DatePrecision = Form(...),
        country: str = Form(...),
        latitude: float = Form(...),
        longitude: float = Form(...),
        city: str = Form(...),
        region: str = Form(...),
        description: str = Form(...),
    ):
        return cls(
            adquisition_date=adquisition_date,
            adquisition_date_precision=adquisition_date_precision,
            country=country,
            latitude=latitude,
            longitude=longitude,
            city=city,
            region=region,
            description=description,
        )
