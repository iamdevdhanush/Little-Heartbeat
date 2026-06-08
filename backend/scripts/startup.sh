#!/usr/bin/env bash
set -e

cd backend

export PYTHONPATH="${PYTHONPATH}:."

# Run migrations (allow failure if DB not ready yet)
alembic upgrade head || echo "Migrations skipped — database not available"

# Start the FastAPI server
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
