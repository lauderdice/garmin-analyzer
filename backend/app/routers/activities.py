import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from garminconnect import GarminConnectTooManyRequestsError

from ..garmin_client import get_garmin_client, reset_client

logger = logging.getLogger(__name__)
router = APIRouter()


def _handle_garmin_error(exc: Exception) -> HTTPException:
    if isinstance(exc, GarminConnectTooManyRequestsError):
        return HTTPException(status_code=429, detail="Garmin Connect rate limit reached")
    logger.error("Garmin API error: %s", exc)
    return HTTPException(status_code=500, detail=str(exc))


@router.get("")
async def list_activities(
    limit: int = Query(default=20, ge=1, le=100),
    start: int = Query(default=0, ge=0),
    activity_type: Optional[str] = Query(default=None, alias="type"),
    from_date: Optional[date] = Query(default=None),
    to_date: Optional[date] = Query(default=None),
):
    """Return a paginated list of activities.

    Use `from_date` / `to_date` (YYYY-MM-DD) to filter by date range.
    Use `type` to filter by activity type (running, cycling, swimming, …).
    """
    client = get_garmin_client()
    try:
        if from_date or to_date:
            start_str = from_date.isoformat() if from_date else "2010-01-01"
            end_str = to_date.isoformat() if to_date else date.today().isoformat()
            raw = client.get_activities_by_date(start_str, end_str, activity_type)
            activities = raw[start : start + limit]
        else:
            activities = client.get_activities(start, limit)

        return {"activities": activities, "count": len(activities), "offset": start}
    except Exception as exc:
        raise _handle_garmin_error(exc) from exc


@router.get("/{activity_id}")
async def get_activity(activity_id: int):
    """Return full details for a single activity."""
    client = get_garmin_client()
    try:
        return client.get_activity(activity_id)
    except Exception as exc:
        raise _handle_garmin_error(exc) from exc
