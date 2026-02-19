import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import activities, health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Garmin Analyzer API",
    description="On-demand access to Garmin Connect data",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(health.router, prefix="/api/health", tags=["health"])


@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError) -> JSONResponse:
    logger.error("RuntimeError: %s", exc)
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    return {"status": "ok"}
