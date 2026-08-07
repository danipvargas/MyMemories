import os
from pathlib import Path

from sqlalchemy import URL, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _secret_or_env(secret_name: str, env_name: str) -> str:
    secret_path = Path(f"/run/secrets/{secret_name}")
    if secret_path.is_file():
        return secret_path.read_text().strip()
    return os.environ[env_name]


POSTGRES_USER = _secret_or_env("postgres_user", "POSTGRES_USER")
POSTGRES_PASSWORD = _secret_or_env("postgres_password", "POSTGRES_PASSWORD")
POSTGRES_DB = _secret_or_env("postgres_db", "POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))


DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username=POSTGRES_USER,
    password=POSTGRES_PASSWORD,
    host=POSTGRES_HOST,
    port=POSTGRES_PORT,
    database=POSTGRES_DB,
)

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
