"""Document upload endpoints — images, PDFs."""

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
import uuid

from app.config import settings
from app.database.session import get_db
from app.models.document import Document
from app.auth.dependencies import get_current_user_id

router = APIRouter()


@router.post("/", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    category: str = "general",
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    upload_dir = Path(settings.UPLOAD_DIR) / user_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    suffix = Path(file.filename).suffix if file.filename else ".bin"
    dest = upload_dir / f"{file_id}{suffix}"
    content = await file.read()
    dest.write_bytes(content)

    entry = Document(
        user_id=user_id,
        category=category,
        title=file.filename,
        file_path=str(dest),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {
        "id": str(entry.id),
        "title": entry.title,
        "category": entry.category,
        "uploaded_at": entry.uploaded_at.isoformat() if entry.uploaded_at else None,
    }
