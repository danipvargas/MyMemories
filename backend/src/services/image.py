from fastapi import UploadFile


def process_and_save_postcard(image: UploadFile):
    return "/data/image.png"


def process_and_save_profile_pic(image: UploadFile):
    return "/data/profile.png"
