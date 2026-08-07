from datetime import date
from typing import Literal

from fastapi import Form
from pydantic import BaseModel, Field

from src.models.postcard import DatePrecision


class PostcardResponse(BaseModel):
    id: int
    user_id: int
    title: str
    adquisition_date: date | None
    adquisition_date_precision: DatePrecision
    country: str
    coordinates: tuple[float, float]
    city: str | None = None
    region: str | None = None
    description: str | None = None


class PostcardCreate(BaseModel):
    user_id: int | None = None
    title: str
    adquisition_date: date | None = None
    adquisition_date_precision: DatePrecision
    country: str
    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False)
    city: str | None = None
    region: str | None = None
    description: str | None = None

    @classmethod
    def as_form(
        cls,
        user_id: int | None = Form(None),
        title: str = Form(...),
        adquisition_date: date | None = Form(None),
        adquisition_date_precision: DatePrecision = Form(...),
        country: str = Form(...),
        latitude: float = Form(..., ge=-90, le=90, allow_inf_nan=False),
        longitude: float = Form(..., ge=-180, le=180, allow_inf_nan=False),
        city: str | None = Form(None),
        region: str | None = Form(None),
        description: str | None = Form(None),
    ):
        return cls(
            user_id=user_id,
            title=title,
            adquisition_date=adquisition_date,
            adquisition_date_precision=adquisition_date_precision,
            country=country,
            latitude=latitude,
            longitude=longitude,
            city=city,
            region=region,
            description=description,
        )


class PostcardUpdate(BaseModel):
    title: str | None = None
    adquisition_date: date | None = None
    adquisition_date_precision: DatePrecision | None = None
    country: str | None = None
    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90,
        allow_inf_nan=False,
    )
    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180,
        allow_inf_nan=False,
    )
    city: str | None = None
    region: str | None = None
    description: str | None = None

    @classmethod
    def as_form(
        cls,
        title: str | None = Form(None),
        adquisition_date: date | None = Form(None),
        adquisition_date_precision: DatePrecision | None = Form(None),
        country: str | None = Form(None),
        latitude: float | None = Form(
            None,
            ge=-90,
            le=90,
            allow_inf_nan=False,
        ),
        longitude: float | None = Form(
            None,
            ge=-180,
            le=180,
            allow_inf_nan=False,
        ),
        city: str | None = Form(None),
        region: str | None = Form(None),
        description: str | None = Form(None),
    ):
        return cls(
            title=title,
            adquisition_date=adquisition_date,
            adquisition_date_precision=adquisition_date_precision,
            country=country,
            latitude=latitude,
            longitude=longitude,
            city=city,
            region=region,
            description=description,
        )


class PostcardFilters(BaseModel):
    user_id: int | None = None
    title: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    country: str | None = None
    city: str | None = None
    region: str | None = None
    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90,
        allow_inf_nan=False,
    )
    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180,
        allow_inf_nan=False,
    )
    radius_km: float | None = Field(default=None, gt=0)


class SortOptions(BaseModel):
    sort_by: Literal[
        "adquisition_date",
        "country",
        "city",
        "region",
    ] = "adquisition_date"
    descending: bool = False
