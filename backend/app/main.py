"""
Little Heartbeat — FastAPI Backend

Entry point. Configures middleware, routers, and lifecycle hooks.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.config import settings
from app.database.session import engine, Base
from app.api import prescriptions, medications, appointments, timeline, emergency, uploads
from app.auth import routes as auth_routes

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ready")
    except Exception as e:
        logger.warning("Could not connect to database: %s", e)
        logger.warning("API will start without database — set DATABASE_URL env var")
    yield


app = FastAPI(
    title="Little Heartbeat API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception:
    pass

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["prescriptions"])
app.include_router(medications.router, prefix="/api/medications", tags=["medications"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])


@app.get("/api/health")
def health():
    db_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        pass
    return {"status": "ok", "database": "connected" if db_ok else "disconnected"}
