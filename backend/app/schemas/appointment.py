from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AppointmentCreate(BaseModel):
    title: str
    scheduled_at: datetime
    location: Optional[str] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str
    title: str
    scheduled_at: datetime
    location: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
