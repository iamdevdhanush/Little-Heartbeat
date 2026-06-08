from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PrescriptionUploadResponse(BaseModel):
    id: str
    raw_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    status: str = "processing"
    created_at: datetime


class PrescriptionConfirmRequest(BaseModel):
    prescription_id: str
    medications: list[dict]


class PrescriptionConfirmResponse(BaseModel):
    status: str
    medications_added: int
