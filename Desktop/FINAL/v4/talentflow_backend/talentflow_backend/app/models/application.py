from sqlalchemy import (
    Column, Integer, String, Text, DateTime,
    Enum, ForeignKey, SmallInteger
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class ApplicationStatus(str, enum.Enum):
    pending  = "pending"
    reviewed = "reviewed"
    selected = "selected"
    rejected = "rejected"
    hired    = "hired"


class Application(Base):
    __tablename__ = "applications"

    id                  = Column(Integer, primary_key=True, index=True)
    offer_id            = Column(Integer, ForeignKey("offers.id", ondelete="CASCADE"), nullable=False)
    user_id             = Column(Integer, ForeignKey("users.id"), nullable=False)
    motivation          = Column(Text, nullable=False)
    cv_filename         = Column(String(255), nullable=True)
    status              = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.pending)
    score               = Column(SmallInteger, nullable=True)
    interview_booked_at = Column(DateTime(timezone=True), nullable=True)   # set by Cal.com webhook
    interview_meet_link = Column(String(500), nullable=True)               # unique Meet link from Cal.com
    applied_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    offer     = relationship("Offer", back_populates="applications")
    candidate = relationship("User", back_populates="applications", foreign_keys=[user_id])
