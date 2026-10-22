"""PulseGuard AI - rPPG Analysis API Route."""
import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas.rppg import RPPGAnalyzeRequest, RPPGAnalyzeResponse
from app.services.rppg_service import rppg_service

logger = logging.getLogger("pulseguard.routes.rppg")

router = APIRouter(prefix="/rppg", tags=["rPPG Pulse Estimation"])


@router.post(
    "/analyze",
    response_model=RPPGAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Estimate rPPG Pulse from Face Video Sequence",
    description="Processes a temporal sequence of facial ROI frames using the pretrained PhysNet 3D-CNN model. Returns estimated heart rate (BPM), signal quality, SNR, and confidence."
)
async def analyze_rppg(payload: RPPGAnalyzeRequest) -> RPPGAnalyzeResponse:
    """Estimates pulse and physiological parameters from a sequence of face frames."""
    if not payload.frames or len(payload.frames) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'frames' array cannot be empty. Please provide a sequence of facial frames."
        )

    # Maximum frames safeguard to prevent memory overload
    if len(payload.frames) > 256:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Frame sequence exceeds maximum buffer limit of 256 frames."
        )

    b64_list = [f.frame_base64 for f in payload.frames if f.frame_base64]
    timestamps = [f.timestamp_ms for f in payload.frames if f.timestamp_ms is not None]
    if len(timestamps) != len(b64_list):
        timestamps = None

    result = rppg_service.analyze_sequence(
        frame_base64_list=b64_list,
        client_fps=payload.fps,
        timestamps_ms=timestamps
    )

    if result.get("status") == "error":
        # Check if error is due to model initialization failure
        if "weights are unavailable" in result.get("message", ""):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=result.get("message")
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "rPPG model processing error.")
        )

    return RPPGAnalyzeResponse(**result)
