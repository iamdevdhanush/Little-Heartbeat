from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MedicationResponse(BaseModel):
    id: str
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    instructions: Optional[str] = None
    active: bool = True
    confirmed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MedicationConfirmRequest(BaseModel):
    medication_id: str
    action: str  # "take" | "skip"
