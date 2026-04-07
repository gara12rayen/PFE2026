from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime,
    Enum, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class OfferStatus(str, enum.Enum):
    open   = "open"
    closed = "closed"


class Offer(Base):
    __tablename__ = "offers"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    skills      = Column(JSON, nullable=False, default=list)
    date_start  = Column(Date, nullable=False)
    date_close  = Column(Date, nullable=False)
    status      = Column(Enum(OfferStatus), nullable=False, default=OfferStatus.open)
    created_by  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_by_user = relationship("User", back_populates="offers")
    applications    = relationship("Application", back_populates="offer", cascade="all, delete-orphan")
