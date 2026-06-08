"""Timeline endpoints — list events by pregnancy week."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.models.timeline_event import TimelineEvent
from app.auth.dependencies import get_current_user_id
from app.schemas.timeline import TimelineEventResponse

router = APIRouter()


@router.get("/", response_model=list[TimelineEventResponse])
def list_events(
    week: Optional[int] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    query = db.query(TimelineEvent).filter(TimelineEvent.user_id == user_id)
    if week is not None:
        query = query.filter(TimelineEvent.week == week)
    return query.order_by(TimelineEvent.week, TimelineEvent.event_date).all()
