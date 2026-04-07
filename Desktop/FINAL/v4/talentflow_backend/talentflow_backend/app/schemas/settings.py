from pydantic import BaseModel
from typing import Optional


class SettingsUpdate(BaseModel):
    calendly_link: Optional[str] = None
    cal_api_key:   Optional[str] = None

    class Config:
        from_attributes = True


class SettingsOut(BaseModel):
    calendly_link: Optional[str]
    cal_api_key:   Optional[str]

    model_config = {"from_attributes": True}
