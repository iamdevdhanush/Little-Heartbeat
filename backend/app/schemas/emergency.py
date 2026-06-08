from pydantic import BaseModel
from typing import Optional


class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relation: Optional[str] = None
    is_primary: bool = False


class EmergencyContactResponse(BaseModel):
    id: str
    name: str
    phone: str
    relation: Optional[str] = None
    is_primary: bool = False

    class Config:
        from_attributes = True
