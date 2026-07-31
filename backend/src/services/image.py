from fastapi import UploadFile


def process_and_save_image(image: UploadFile):
    return "/data/image.png"
