"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bi_user:bi_password@db:5432/bi_db")

# Optimize connection pool for better performance
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,  # Number of connections to maintain
    max_overflow=20,  # Maximum overflow connections
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=False,  # Set to True for SQL query logging (debug only)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

