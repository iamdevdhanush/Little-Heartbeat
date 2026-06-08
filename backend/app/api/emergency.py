"""Emergency contact endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.emergency_contact import EmergencyContact
from app.auth.dependencies import get_current_user_id
from app.schemas.emergency import EmergencyContactCreate, EmergencyContactResponse

router = APIRouter()


@router.get("/", response_model=list[EmergencyContactResponse])
def list_contacts(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return db.query(EmergencyContact).filter(EmergencyContact.user_id == user_id).all()


@router.post("/", response_model=EmergencyContactResponse, status_code=201)
def create_contact(
    body: EmergencyContactCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    entry = EmergencyContact(user_id=user_id, **body.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{contact_id}")
def delete_contact(
    contact_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    entry = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.user_id == user_id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404)
    db.delete(entry)
    db.commit()
    return {"status": "deleted"}
