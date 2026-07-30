from sqlalchemy import URL, create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from pathlib import Path

POSTGRES_USER = Path("/run/secrets/postgres_user").read_text().strip()
POSTGRES_PASSWORD = Path("/run/secrets/postgres_password").read_text().strip()
POSTGRES_DB = Path("/run/secrets/postgres_db").read_text().strip()


DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username=POSTGRES_USER,
    password=POSTGRES_PASSWORD,
    host="postgres",
    port=5432,
    database=POSTGRES_DB,
)

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()