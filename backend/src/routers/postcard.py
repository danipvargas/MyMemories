from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from src.database import get_db
from src.repository.postcard import (
    create_postcard,
    delete_postcard_by_id,
    get_postcards,
    update_postcard,
)
from src.schemas.postcard import PostcardCreate, PostcardResponse, PostcardUpdate
from src.services.image import process_and_save_postcard

router = APIRouter(prefix="/postcards", tags=["postcards"])


@router.post("/", response_model=PostcardResponse)
def add_postcard(
    new_postcard: PostcardCreate = Depends(PostcardCreate.as_form),
    postcard_image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_path = process_and_save_postcard(postcard_image)

    return create_postcard(
        db=db, new_postcard=new_postcard, postcard_img_path=image_path
    )


@router.get("/", response_model=list[PostcardResponse])
def read_users(db: Session = Depends(get_db)):
    return get_postcards(db)


@router.delete("/{postcard_id}", response_model=PostcardResponse)
def delete_user(postcard_id: int, db: Session = Depends(get_db)):
    return delete_postcard_by_id(db, postcard_id=postcard_id)


@router.patch("/{postcard_id}", response_model=PostcardResponse)
def patch_user(
    postcard_id: int, modified_fields: PostcardUpdate, db: Session = Depends(get_db)
):
    return update_postcard(db, postcard_id=postcard_id, modified_fields=modified_fields)
