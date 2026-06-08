from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TimelineEventResponse(BaseModel):
    id: str
    week: int
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = None
    event_date: Optional[datetime] = None

    class Config:
        from_attributes = True
