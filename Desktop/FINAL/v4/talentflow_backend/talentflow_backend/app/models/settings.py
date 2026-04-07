from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class PlatformSettings(Base):
    """Stores global platform configuration (one row only)."""
    __tablename__ = "platform_settings"

    id            = Column(Integer, primary_key=True, index=True)
    calendly_link = Column(String(500), nullable=True)   # Cal.com booking link
    cal_api_key   = Column(String(500), nullable=True)   # Cal.com API key for fetching bookings
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
