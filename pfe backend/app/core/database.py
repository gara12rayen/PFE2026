from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True,       # auto-reconnect if MySQL drops connection
    pool_recycle=3600,        # recycle connections every hour
    echo=False,               # set True to see SQL queries in console
)
# save changes to database to avoid accident data loss
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# use database table as class python models
class Base(DeclarativeBase):
    pass


#
def get_db():
    db = SessionLocal()
    try:
        yield db #pause here and return to close connection after request is done
    finally:
        db.close()
