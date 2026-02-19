import logging
import os
from threading import Lock

from garminconnect import (
    Garmin,
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

logger = logging.getLogger(__name__)

_client: Garmin | None = None
_lock = Lock()


def get_garmin_client() -> Garmin:
    """Return a cached, authenticated Garmin Connect client.

    On the first call the client authenticates using GARMIN_USERNAME /
    GARMIN_PASSWORD environment variables. Subsequent calls return the same
    instance for the lifetime of the process (Cloud Run container).
    """
    global _client

    with _lock:
        if _client is not None:
            return _client

        username = os.environ.get("GARMIN_USERNAME")
        password = os.environ.get("GARMIN_PASSWORD")

        if not username or not password:
            raise RuntimeError(
                "GARMIN_USERNAME and GARMIN_PASSWORD environment variables must be set"
            )

        logger.info("Authenticating with Garmin Connect…")
        client = Garmin(email=username, password=password)

        try:
            client.login()
        except GarminConnectAuthenticationError as exc:
            raise RuntimeError(f"Garmin authentication failed: {exc}") from exc
        except GarminConnectConnectionError as exc:
            raise RuntimeError(f"Could not connect to Garmin Connect: {exc}") from exc
        except GarminConnectTooManyRequestsError as exc:
            raise RuntimeError(f"Garmin Connect rate limit reached: {exc}") from exc

        _client = client
        logger.info("Successfully authenticated with Garmin Connect")
        return _client


def reset_client() -> None:
    """Clear the cached client – useful after an auth error to force re-login."""
    global _client
    with _lock:
        _client = None
