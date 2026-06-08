"""Initial database schema

Revision ID: 0001
Revises:
Create Date: 2026-06-08
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("blood_type", sa.String(10), nullable=True),
        sa.Column("allergies", sa.String(500), nullable=True),
        sa.Column("conditions", sa.String(500), nullable=True),
        sa.Column("doctor_name", sa.String(255), nullable=True),
        sa.Column("doctor_phone", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        "pregnancies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("baby_name", sa.String(255), nullable=True),
        sa.Column("fetal_sex", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "prescriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("ocr_confidence", sa.Float(), nullable=True),
        sa.Column("doctor", sa.JSON(), nullable=True),
        sa.Column("dates", sa.JSON(), nullable=True),
        sa.Column("confidence", sa.JSON(), nullable=True),
        sa.Column("file_path", sa.String(500), nullable=True),
        sa.Column("status", sa.String(50), default="pending"),
        sa.Column("reviewed", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "medications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("prescription_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("prescriptions.id"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("dosage", sa.String(100), nullable=True),
        sa.Column("frequency", sa.String(100), nullable=True),
        sa.Column("frequency_numeric", sa.Integer(), nullable=True),
        sa.Column("frequency_per", sa.String(50), nullable=True),
        sa.Column("timing", sa.String(255), nullable=True),
        sa.Column("duration", sa.String(100), nullable=True),
        sa.Column("instructions", sa.String(500), nullable=True),
        sa.Column("active", sa.Boolean(), default=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "reminders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("medication_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("medications.id"), nullable=False),
        sa.Column("scheduled_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(50), default="pending"),
        sa.Column("taken_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("skipped_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "appointments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "timeline_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("pregnancy_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("pregnancies.id"), nullable=True),
        sa.Column("week", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("emoji", sa.String(50), nullable=True),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "emergency_contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=False),
        sa.Column("relation", sa.String(100), nullable=True),
        sa.Column("is_primary", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("emergency_contacts")
    op.drop_table("documents")
    op.drop_table("timeline_events")
    op.drop_table("appointments")
    op.drop_table("reminders")
    op.drop_table("medications")
    op.drop_table("prescriptions")
    op.drop_table("pregnancies")
    op.drop_table("users")
