"""Prescription endpoints — upload, parse, confirm."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
import uuid

from app.config import settings
from app.database.session import get_db
from app.models.prescription import Prescription
from app.models.medication import Medication
from app.auth.dependencies import get_current_user_id
from app.services.ocr import extract_text
from app.services.prescription_parser import parse_prescription_text
from app.schemas.prescription import PrescriptionUploadResponse, PrescriptionConfirmRequest, PrescriptionConfirmResponse

router = APIRouter()


@router.post("/upload", response_model=PrescriptionUploadResponse)
async def upload_prescription(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    upload_dir = Path(settings.UPLOAD_DIR) / user_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    suffix = Path(file.filename).suffix if file.filename else ".pdf"
    dest = upload_dir / f"{file_id}{suffix}"
    content = await file.read()
    dest.write_bytes(content)

    raw_text = extract_text(str(dest))
    parsed = parse_prescription_text(raw_text) if raw_text else []

    entry = Prescription(
        user_id=user_id,
        raw_text=raw_text,
        file_path=str(dest),
        status="parsed" if parsed else "failed",
        ocr_confidence=None,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return PrescriptionUploadResponse(
        id=str(entry.id),
        raw_text=raw_text,
        ocr_confidence=entry.ocr_confidence,
        status=entry.status,
        created_at=entry.created_at,
    )


@router.post("/confirm", response_model=PrescriptionConfirmResponse)
def confirm_prescription(
    body: PrescriptionConfirmRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    prescription = db.query(Prescription).filter(
        Prescription.id == body.prescription_id,
        Prescription.user_id == user_id,
    ).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    count = 0
    for med in body.medications:
        db.add(Medication(user_id=user_id, prescription_id=prescription.id, **med))
        count += 1

    prescription.reviewed = True
    prescription.status = "confirmed"
    db.commit()

    return PrescriptionConfirmResponse(status="confirmed", medications_added=count)
