from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from src.database import get_db
from src.repository.postcard import create_postcard
from src.schemas.postcard import PostcardCreate, PostcardResponse
from src.services.image import process_and_save_image

router = APIRouter(prefix="/postcards", tags=["postcards"])


@router.post("/", response_model=PostcardResponse)
def add_postcard(
    new_postcard: PostcardCreate = Depends(PostcardCreate.as_form),
    postcard_image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_path = process_and_save_image(postcard_image)

    return create_postcard(
        db=db, new_postcard=new_postcard, postcard_img_path=image_path
    )
