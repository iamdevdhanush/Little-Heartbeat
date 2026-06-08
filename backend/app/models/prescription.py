from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database.session import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    raw_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    doctor = Column(JSON, nullable=True)
    dates = Column(JSON, nullable=True)
    confidence = Column(JSON, nullable=True)
    file_path = Column(String(500), nullable=True)
    status = Column(String(50), default="pending")
    reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
