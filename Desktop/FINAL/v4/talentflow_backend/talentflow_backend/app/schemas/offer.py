from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date, datetime
from app.models.offer import OfferStatus


class OfferCreate(BaseModel):
    title: str
    description: str
    skills: List[str] = []
    date_start: date
    date_close: date
    status: OfferStatus = OfferStatus.open

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Le titre ne peut pas être vide")
        return v.strip()

    @field_validator("date_close")
    @classmethod
    def close_after_start(cls, v, info):
        if "date_start" in info.data and v < info.data["date_start"]:
            raise ValueError("La date de clôture doit être après la date d'ouverture")
        return v


class OfferUpdate(BaseModel):
    title:       Optional[str]          = None
    description: Optional[str]          = None
    skills:      Optional[List[str]]    = None
    date_start:  Optional[date]         = None
    date_close:  Optional[date]         = None
    status:      Optional[OfferStatus]  = None


class OfferOut(BaseModel):
    id:          int
    title:       str
    description: str
    skills:      List[str]
    date_start:  date
    date_close:  date
    status:      OfferStatus
    created_by:  int
    created_at:  Optional[datetime]
    applications_count: Optional[int] = 0
    created_by_name:    Optional[str] = None

    model_config = {"from_attributes": True}
