from geoalchemy2.elements import WKTElement
from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session

from src.models.postcard import PostCard
from src.schemas.postcard import PostcardCreate, PostcardResponse


def create_postcard(db: Session, new_postcard: PostcardCreate, postcard_img_path: str):
    db_postcard = PostCard(
        image_path=postcard_img_path,
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

    point = to_shape(db_postcard.coordinates)

    return PostcardResponse(
        id=db_postcard.id,
        image_path=db_postcard.image_path,
        adquisition_date=db_postcard.adquisition_date,
        adquisition_date_precision=db_postcard.adquisition_date_precision,
        country=db_postcard.country,
        city=db_postcard.city,
        region=db_postcard.region,
        coordinates=(point.y, point.x),
        description=db_postcard.description,
    )
