from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database.session import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=True)
    title = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=False)
    ai_summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
