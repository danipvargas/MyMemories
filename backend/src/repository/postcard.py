from typing import Any

from geoalchemy2.elements import WKTElement
from geoalchemy2.functions import ST_DWithin
from sqlalchemy import distinct, extract, func, select
from sqlalchemy.orm import Session

from src.models.postcard import Postcard
from src.schemas.base import Pagination
from src.schemas.postcard import PostcardCreate, PostcardFilters, SortOptions


def create_postcard(
    db: Session,
    new_postcard: PostcardCreate,
    postcard_image_path: str,
    cover_path: str,
) -> Postcard:
    """
    Create a new postcard and store it in the database.

    Args:
        db: Active database session.
        new_postcard: Data used to create the postcard.
        postcard_image_path: Path where the postcard image is stored.

    Returns:
        The newly created postcard.
    """
    db_postcard = Postcard(
        image_path=postcard_image_path,
        cover_path=cover_path,
        user_id=new_postcard.user_id,
        title=new_postcard.title,
        adquisition_date=new_postcard.adquisition_date,
        adquisition_date_precision=new_postcard.adquisition_date_precision,
        country=new_postcard.country,
        city=new_postcard.city,
        region=new_postcard.region,
        coordinates=WKTElement(
            f"POINT({new_postcard.longitude} {new_postcard.latitude})",
            srid=4326,
        ),
        description=new_postcard.description,
    )

    db.add(db_postcard)
    db.commit()
    db.refresh(db_postcard)

    return db_postcard


def delete_postcard(db: Session, postcard_id: int) -> Postcard | None:
    """
    Delete a postcard from the database by its identifier.

    Args:
        db: Active database session.
        postcard_id: Identifier of the postcard to delete.

    Returns:
        The deleted postcard if it exists, otherwise None.
    """
    postcard = db.get(Postcard, postcard_id)

    if postcard is None:
        return None

    db.delete(postcard)
    db.commit()

    return postcard


def update_postcard(
    db: Session,
    postcard: Postcard,
    update_data: dict[str, Any],
    new_postcard_image_path: str | None = None,
    new_postcard_cover_path: str | None = None,
) -> Postcard:
    """
    Update the fields of an existing postcard.

    Args:
        db: Active database session.
        postcard: Postcard instance to update.
        update_data: Dictionary containing the fields and values to update.
        new_postcard_image_path: New image path to assign to the postcard, if provided.
        new_postcard_cover_path: New cover path to assign to the postcard, if provided.

    Returns:
        The updated postcard.
    """
    for field, value in update_data.items():
        setattr(postcard, field, value)

    if new_postcard_image_path is not None:
        postcard.image_path = new_postcard_image_path

    if new_postcard_cover_path is not None:
        postcard.cover_path = new_postcard_cover_path

    db.commit()
    db.refresh(postcard)

    return postcard


def update_map_path(db: Session, postcard: Postcard, map_path: str | None) -> Postcard:
    """Store the generated map preview path for a postcard."""
    postcard.map_path = map_path
    db.commit()
    db.refresh(postcard)

    return postcard


def get_postcards(
    db: Session,
    filters: PostcardFilters,
    sorting: SortOptions,
    pagination: Pagination,
) -> list[Postcard]:
    """
    Retrieve all postcards from the database matching the given filters .

    Args:
        db: Active database session.
        filters: Different optional filters to select which postcards return.
        sorting: Parameter to set how to order the postcards.
        pagination: Pagination parameters.

    Returns:
        A list containing all stored postcards.
    """
    stmt = select(Postcard)
    conditions = []

    if filters.user_id:
        conditions.append(Postcard.user_id == filters.user_id)

    if filters.title:
        conditions.append(Postcard.title.ilike(f"%{filters.title}%"))

    if filters.country:
        conditions.append(Postcard.country.ilike(f"%{filters.country}%"))

    if filters.city:
        conditions.append(Postcard.city.ilike(f"%{filters.city}%"))

    if filters.region:
        conditions.append(Postcard.region.ilike(f"%{filters.region}%"))

    if filters.start_date:
        conditions.append(Postcard.adquisition_date >= filters.start_date)

    if filters.end_date:
        conditions.append(Postcard.adquisition_date <= filters.end_date)

    if (
        filters.latitude is not None
        and filters.longitude is not None
        and filters.radius_km is not None
    ):
        point = WKTElement(
            f"POINT({filters.longitude} {filters.latitude})",
            srid=4326,
        )

        stmt = stmt.where(
            ST_DWithin(
                Postcard.coordinates,
                point,
                filters.radius_km * 1000,
            )
        )

    if conditions:
        stmt = stmt.where(*conditions)

    sort_columns = {
        "adquisition_date": Postcard.adquisition_date,
        "country": Postcard.country,
        "city": Postcard.city,
        "region": Postcard.region,
    }

    column = sort_columns[sorting.sort_by]

    stmt = stmt.order_by(
        column.desc().nulls_last() if sorting.descending else column.asc().nulls_last()
    )

    offset = (pagination.page - 1) * pagination.page_size
    stmt = stmt.offset(offset).limit(pagination.page_size)

    return db.scalars(stmt).all()


def get_postcard_by_id(db: Session, postcard_id: int) -> Postcard:
    """
    Retrieve a postcard by its identifier.

    Args:
        db: Active database session.
        postcard_id: Identifier of the postcard to retrieve.

    Returns:
        The matching postcard if found, otherwise None.
    """
    return db.get(Postcard, postcard_id)


def compute_user_stats(db: Session, user_id: int) -> dict:
    TOP_K = 3

    stmt = select(
        func.count(Postcard.id).label("total_postcards"),
        func.count(distinct(Postcard.country)).label("total_countries"),
        func.count(distinct(Postcard.city)).label("total_cities"),
        func.min(Postcard.adquisition_date).label("oldest_postcard"),
    ).where(Postcard.user_id == user_id)

    result = db.execute(stmt).one()

    total_postcards = result.total_postcards
    total_countries = result.total_countries
    total_cities = result.total_cities
    oldest_postcard = result.oldest_postcard

    postcards_per_country = func.count(Postcard.id).label("postcards_per_country")

    stmt = (
        select(Postcard.country, postcards_per_country)
        .where(Postcard.user_id == user_id)
        .group_by(Postcard.country)
        .order_by(postcards_per_country.desc())
        .limit(TOP_K)
    )

    rows = db.execute(stmt).all()

    top_countries = {row.country: row.postcards_per_country for row in rows}

    stmt = (
        select(
            extract("year", Postcard.adquisition_date).label("year"),
            func.count(distinct(Postcard.id)).label("postcards_per_year"),
        )
        .where(
            Postcard.user_id == user_id,
            Postcard.adquisition_date.is_not(None),
        )
        .group_by(extract("year", Postcard.adquisition_date))
        .order_by(extract("year", Postcard.adquisition_date).desc())
    )

    rows = db.execute(stmt).all()

    postcards_per_year = {int(row.year): row.postcards_per_year for row in rows}

    return {
        "total_postcards": total_postcards,
        "total_countries": total_countries,
        "total_cities": total_cities,
        "oldest_postcard": oldest_postcard,
        "top_countries": top_countries,
        "postcards_per_year": postcards_per_year,
    }
