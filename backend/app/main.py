"""
Little Heartbeat — FastAPI Backend

Entry point. Configures middleware, routers, and lifecycle hooks.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.session import engine, Base
from app.api import prescriptions, medications, appointments, timeline, emergency, uploads
from app.auth import routes as auth_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
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

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["prescriptions"])
app.include_router(medications.router, prefix="/api/medications", tags=["medications"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
