from fastapi import FastAPI

from src.database import Base, engine
from src.routers.user import router as users_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MyMemories Database API",
    description="API for update and search on the users and memories database",
    version="1.0.0",
    contact={"name": "Daniel Pérez Vargas", "email": "danpv2000@gmail.com"},
    openapi_tags=[
        {"name": "users", "description": "CRUD operations related to users."},
        {
            "name": "postcards",
            "description": "CRUD operations related to postcards. Include some "
            "filtered search focused ones.",
        },
    ],
)

app.include_router(users_router)
