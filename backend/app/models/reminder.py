from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database.session import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    medication_id = Column(UUID(as_uuid=True), ForeignKey("medications.id"), nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="pending")
    taken_at = Column(DateTime(timezone=True), nullable=True)
    skipped_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
