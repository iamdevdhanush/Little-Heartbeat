"""Authentication routes — login, token exchange, profile."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

from app.config import settings
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.auth.dependencies import get_current_user_id

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=_create_token(str(user.id)), user_id=str(user.id))


@router.get("/me")
def get_profile(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404)
    return user
