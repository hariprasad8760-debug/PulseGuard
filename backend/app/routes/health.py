"""Health check API route."""
from fastapi import APIRouter, status
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Returns backend application health and framework information."
)
async def get_health() -> HealthResponse:
    """Returns verified health check status of the FastAPI backend."""
    return HealthResponse(
        status="ok",
        application=settings.APP_NAME,
        version=settings.APP_VERSION,
        backend="fastapi"
    )
