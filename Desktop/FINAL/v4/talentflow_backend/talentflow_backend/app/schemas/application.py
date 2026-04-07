from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    offer_id: int
    motivation: str

    @field_validator("motivation")
    @classmethod
    def motivation_not_empty(cls, v):
        if not v.strip():
            raise ValueError("La lettre de motivation ne peut pas être vide")
        return v.strip()


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    score: Optional[int] = None

    @field_validator("score")
    @classmethod
    def score_range(cls, v):
        if v is not None and not (0 <= v <= 100):
            raise ValueError("Le score doit être entre 0 et 100")
        return v


class ApplicationOut(BaseModel):
    id:                   int
    offer_id:             int
    user_id:              int
    motivation:           str
    cv_filename:          Optional[str]
    status:               ApplicationStatus
    score:                Optional[int]
    interview_booked_at:  Optional[datetime]
    interview_meet_link:  Optional[str]
    applied_at:           Optional[datetime]
    updated_at:           Optional[datetime]

    # Computed / joined fields
    candidate_name:  Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    offer_title:     Optional[str] = None

    model_config = {"from_attributes": True}
