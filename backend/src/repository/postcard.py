from geoalchemy2.elements import WKTElement
from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session

from src.models.postcard import Postcard
from src.schemas.postcard import PostcardCreate, PostcardResponse, PostcardUpdate


def convert_db_postcard_to_response(db_postcard: Postcard):
    point = to_shape(db_postcard.coordinates)

    return PostcardResponse(
        id=db_postcard.id,
        user_id=db_postcard.user_id,
        image_path=db_postcard.image_path,
        adquisition_date=db_postcard.adquisition_date,
        adquisition_date_precision=db_postcard.adquisition_date_precision,
        country=db_postcard.country,
        city=db_postcard.city,
        region=db_postcard.region,
        coordinates=(point.y, point.x),
        description=db_postcard.description,
    )


def create_postcard(db: Session, new_postcard: PostcardCreate, postcard_img_path: str):
    db_postcard = Postcard(
        image_path=postcard_img_path,
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

    return convert_db_postcard_to_response(db_postcard=db_postcard)


def delete_postcard_by_id(db: Session, postcard_id: int):
    postcard = db.get(Postcard, postcard_id)

    if postcard is None:
        return None

    db.delete(postcard)
    db.commit()

    return convert_db_postcard_to_response(db_postcard=postcard)


def update_postcard(db: Session, postcard_id: int, modified_fields: PostcardUpdate):
    postcard = db.get(Postcard, postcard_id)

    if postcard is None:
        return None

    update_data = modified_fields.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field != "id":
            setattr(postcard, field, value)

    db.commit()
    db.refresh(postcard)

    return convert_db_postcard_to_response(db_postcard=postcard)


def get_postcards(db: Session):
    existing_postcards = db.query(Postcard).all()

    return [
        convert_db_postcard_to_response(db_postcard=pc) for pc in existing_postcards
    ]
