#!/usr/bin/env bash
set -e

cd backend

# Ensure the backend directory is on the Python path
export PYTHONPATH="${PYTHONPATH}:."

# Run migrations
alembic upgrade head

# Start the FastAPI server
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
