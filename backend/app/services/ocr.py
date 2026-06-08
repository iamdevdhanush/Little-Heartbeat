"""OCR service — PDF/image text extraction via pdfminer + pytesseract."""

from pathlib import Path

from app.config import settings


def extract_text_from_pdf(file_path: str) -> str:
    from pdfminer.high_level import extract_text as pdf_extract
    return pdf_extract(file_path)


def extract_text_from_image(file_path: str) -> str:
    from PIL import Image
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    return pytesseract.image_to_string(Image.open(file_path))


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    if suffix in (".png", ".jpg", ".jpeg", ".bmp", ".tiff"):
        return extract_text_from_image(file_path)
    return ""
