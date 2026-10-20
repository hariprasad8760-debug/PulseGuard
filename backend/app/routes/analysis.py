"""AI Analysis API route (Contract & validation)."""
from fastapi import APIRouter, status, HTTPException
from fastapi.responses import JSONResponse
from app.schemas.analysis import AnalyzeRequest, AnalyzeNotReadyResponse

router = APIRouter(tags=["Analysis"])

# Size limit: Reject payload with frame_base64 exceeding 5MB to protect server memory
MAX_FRAME_BASE64_LENGTH = 5 * 1024 * 1024


@router.post(
    "/analyze",
    response_model=AnalyzeNotReadyResponse,
    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
    responses={
        503: {
            "model": AnalyzeNotReadyResponse,
            "description": "AI analysis modules are in development and not yet available for inference."
        },
        413: {
            "description": "Payload too large."
        }
    },
    summary="Video Frame & Security Analysis (Stage 1 Contract)",
    description="Validates incoming request format and informs client that AI models will be integrated in subsequent steps."
)
async def analyze_frame(request: AnalyzeRequest):
    """Validates analysis request contract.
    
    Returns 503 Service Unavailable with a structured payload explaining
    that AI detection modules (OpenCV, MediaPipe, PhysNet, CNN) are scheduled
    for subsequent implementation steps. Never generates fake metrics.
    """
    if request.frame_base64 and len(request.frame_base64) > MAX_FRAME_BASE64_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Frame payload exceeds 5MB size limit."
        )

    response_data = AnalyzeNotReadyResponse(
        status="not_ready",
        message="AI analysis will be available after the detection modules are integrated.",
        supported_modules=[
            "face_detection",
            "rppg",
            "deepfake_detection",
            "temporal_analysis",
            "risk_assessment"
        ]
    )

    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=response_data.model_dump()
    )
