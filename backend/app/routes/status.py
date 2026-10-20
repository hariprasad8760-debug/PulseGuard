"""Backend and AI module status route."""
from fastapi import APIRouter, status
from app.core.config import settings
from app.schemas.status import StatusResponse, BackendInfo, ModuleStatus
from app.services import (
    face_service,
    rppg_service,
    deepfake_service,
    temporal_service,
    risk_engine
)

router = APIRouter(tags=["Status"])


@router.get(
    "/status",
    response_model=StatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Backend & Module Status",
    description="Returns verified status of the backend and real implementation status of planned AI modules."
)
async def get_status() -> StatusResponse:
    """Returns actual implementation status for all components.
    
    IMPORTANT: Reflects actual system state. Never reports modules as working
    until models and algorithms are actually verified and functional.
    """
    return StatusResponse(
        backend=BackendInfo(
            available=True,
            version=settings.APP_VERSION,
            environment=settings.ENVIRONMENT
        ),
        modules=ModuleStatus(
            face_detection=face_service.get_status(),
            rppg=rppg_service.get_status(),
            deepfake_detection=deepfake_service.get_status(),
            temporal_analysis=temporal_service.get_status(),
            risk_assessment=risk_engine.get_status()
        )
    )
