"""Appointment endpoints — CRUD."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.appointment import Appointment
from app.auth.dependencies import get_current_user_id
from app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter()


@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    items = db.query(Appointment).filter(Appointment.user_id == user_id).order_by(Appointment.scheduled_at).all()
    return items


@router.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    body: AppointmentCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    entry = Appointment(user_id=user_id, **body.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    entry = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.user_id == user_id).first()
    if not entry:
        raise HTTPException(status_code=404)
    db.delete(entry)
    db.commit()
    return {"status": "deleted"}
