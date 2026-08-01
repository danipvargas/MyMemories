from typing import Any

from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from src.models.postcard import Postcard
from src.schemas.postcard import PostcardCreate


def create_postcard(
    db: Session, new_postcard: PostcardCreate, postcard_image_path: str
):
    db_postcard = Postcard(
        image_path=postcard_image_path,
        user_id=new_postcard.user_id,
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


def delete_postcard(db: Session, postcard_id: int):
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
) -> Postcard:
    for field, value in update_data.items():
        setattr(postcard, field, value)

    if new_postcard_image_path is not None:
        postcard.image_path = new_postcard_image_path

    db.commit()
    db.refresh(postcard)

    return postcard


def get_postcards(db: Session):
    return db.query(Postcard).all()


def get_postcard_by_id(db: Session, postcard_id: int):
    return db.get(Postcard, postcard_id)
