import logging
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from garminconnect import GarminConnectTooManyRequestsError

from ..garmin_client import get_garmin_client

logger = logging.getLogger(__name__)
router = APIRouter()


def _today() -> str:
    return date.today().isoformat()


def _handle_error(exc: Exception) -> HTTPException:
    if isinstance(exc, GarminConnectTooManyRequestsError):
        return HTTPException(status_code=429, detail="Garmin Connect rate limit reached")
    logger.error("Garmin API error: %s", exc)
    return HTTPException(status_code=500, detail=str(exc))


@router.get("/stats")
async def get_daily_stats(cdate: Optional[str] = Query(default=None)):
    """Daily summary stats (steps, calories, resting HR, sleep, body battery)."""
    client = get_garmin_client()
    try:
        return client.get_stats(cdate or _today())
    except Exception as exc:
        raise _handle_error(exc) from exc


@router.get("/steps")
async def get_steps(cdate: Optional[str] = Query(default=None)):
    """Intraday step data (5-min buckets) for a given day."""
    client = get_garmin_client()
    try:
        return client.get_steps_data(cdate or _today())
    except Exception as exc:
        raise _handle_error(exc) from exc


@router.get("/heartrate")
async def get_heart_rate(cdate: Optional[str] = Query(default=None)):
    """Heart rate samples for a given day."""
    client = get_garmin_client()
    try:
        return client.get_heart_rates(cdate or _today())
    except Exception as exc:
        raise _handle_error(exc) from exc


@router.get("/sleep")
async def get_sleep(cdate: Optional[str] = Query(default=None)):
    """Sleep tracking data for a given night."""
    client = get_garmin_client()
    try:
        return client.get_sleep_data(cdate or _today())
    except Exception as exc:
        raise _handle_error(exc) from exc


@router.get("/stress")
async def get_stress(cdate: Optional[str] = Query(default=None)):
    """Stress level data for a given day."""
    client = get_garmin_client()
    try:
        return client.get_stress_data(cdate or _today())
    except Exception as exc:
        raise _handle_error(exc) from exc


@router.get("/body-battery")
async def get_body_battery(
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
):
    """Body battery charge/drain over a date range (default: last 7 days)."""
    client = get_garmin_client()
    sd = start_date or (date.today() - timedelta(days=6)).isoformat()
    ed = end_date or _today()
    try:
        return client.get_body_battery(sd, ed)
    except Exception as exc:
        raise _handle_error(exc) from exc


@router.get("/summary")
async def get_health_summary(days: int = Query(default=7, ge=1, le=30)):
    """Aggregate daily stats for the last N days (for trend charts)."""
    client = get_garmin_client()
    end = date.today()
    results = []
    for i in range(days - 1, -1, -1):
        cdate = (end - timedelta(days=i)).isoformat()
        try:
            stats = client.get_stats(cdate)
            if stats:
                results.append(stats)
        except Exception:
            pass  # Skip days with missing data
    return {"summary": results}
