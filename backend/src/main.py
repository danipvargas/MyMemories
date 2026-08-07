from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import ALLOWED_ORIGINS
from src.database import Base, engine
from src.exceptions.base import MyMemoriesError
from src.routers.auth import router as auth_router
from src.routers.postcard import router as postcards_router
from src.routers.user import router as users_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MyMemories Database API",
    description="API for update and search on the users and memories database",
    version="1.0.0",
    contact={"name": "Daniel Pérez Vargas", "email": "danpv2000@gmail.com"},
    openapi_tags=[
        {"name": "Users", "description": "CRUD operations related to users."},
        {
            "name": "Postcards",
            "description": "CRUD operations related to postcards. Include some "
            "filtered search focused ones.",
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(users_router)
app.include_router(postcards_router)
app.include_router(auth_router)


@app.exception_handler(MyMemoriesError)
async def handle_application_error(
    request: Request,
    exc: MyMemoriesError,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )
