from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database.session import Base


class Medication(Base):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id"), nullable=True)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    frequency_numeric = Column(Integer, nullable=True)
    frequency_per = Column(String(50), nullable=True)
    timing = Column(String(255), nullable=True)
    duration = Column(String(100), nullable=True)
    instructions = Column(String(500), nullable=True)
    active = Column(Boolean, default=True)
    confirmed_at = Column(DateTime(timezone=True), server_default=func.now())
