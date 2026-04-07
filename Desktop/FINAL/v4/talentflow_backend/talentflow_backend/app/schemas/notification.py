from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationType


class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    message: str
    application_id: Optional[int]
    is_read: bool
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
