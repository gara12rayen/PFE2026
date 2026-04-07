from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    candidate = "candidate"
    rh = "rh"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120), nullable=False)
    email      = Column(String(180), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)          # bcrypt hash
    role       = Column(Enum(UserRole), nullable=False, default=UserRole.candidate)
    phone      = Column(String(30), nullable=True)
    department = Column(String(120), nullable=True)           # for RH managers
    is_active  = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    applications  = relationship("Application", back_populates="candidate", foreign_keys="Application.user_id")
    offers        = relationship("Offer", back_populates="created_by_user")
    notifications = relationship("Notification", back_populates="user")
