from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# ============================================================
# DATABASE ENGINE CONFIGURATION
# ============================================================

database_url = settings.DATABASE_URL

connect_args = {}

# ------------------------------------------------------------
# SQLite
# ------------------------------------------------------------

if database_url.startswith("sqlite"):
    # Needed for SQLite + FastAPI's threaded request handling.
    connect_args = {
        "check_same_thread": False,
    }

# ------------------------------------------------------------
# MySQL / Aiven
# ------------------------------------------------------------

elif database_url.startswith("mysql+pymysql"):
    # PyMySQL expects SSL configuration as a dictionary.
    # Do NOT use ?ssl=true in the DATABASE_URL.
    connect_args = {
        "ssl": {},
    }


# ============================================================
# SQLAlchemy ENGINE
# ============================================================

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    future=True,
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# FASTAPI DATABASE DEPENDENCY
# ============================================================

def get_db():
    """
    FastAPI dependency that yields a DB session
    and always closes it.
    """

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()