"""Medication endpoints — list, confirm take/skip."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database.session import get_db
from app.models.medication import Medication
from app.models.reminder import Reminder
from app.auth.dependencies import get_current_user_id
from app.schemas.medication import MedicationResponse, MedicationConfirmRequest

router = APIRouter()


@router.get("/", response_model=list[MedicationResponse])
def list_medications(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    items = db.query(Medication).filter(
        Medication.user_id == user_id,
        Medication.active == True,
    ).all()
    return items


@router.post("/confirm")
def confirm_medication(
    body: MedicationConfirmRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    med = db.query(Medication).filter(
        Medication.id == body.medication_id,
        Medication.user_id == user_id,
    ).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    reminder = Reminder(
        user_id=user_id,
        medication_id=med.id,
        scheduled_time=datetime.now(timezone.utc),
        status="taken" if body.action == "take" else "skipped",
        taken_at=datetime.now(timezone.utc) if body.action == "take" else None,
        skipped_at=datetime.now(timezone.utc) if body.action == "skip" else None,
    )
    db.add(reminder)
    db.commit()

    return {"status": "ok", "action": body.action}
