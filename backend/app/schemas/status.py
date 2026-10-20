"""Backend status and module readiness schemas."""
from pydantic import BaseModel, Field


class BackendInfo(BaseModel):
    """General information about the Python FastAPI backend."""
    available: bool = Field(default=True, description="Whether the backend service is responding")
    version: str = Field(..., description="Backend release version")
    environment: str = Field(..., description="Runtime environment")


class ModuleStatus(BaseModel):
    """Actual implementation status for all planned AI detection modules."""
    face_detection: str = Field(default="not_implemented", description="OpenCV/MediaPipe face detection")
    rppg: str = Field(default="not_implemented", description="PhysNet/POS/CHROM pulse analysis")
    deepfake_detection: str = Field(default="not_implemented", description="CNN deepfake detection")
    temporal_analysis: str = Field(default="not_implemented", description="Temporal landmark & motion consistency")
    risk_assessment: str = Field(default="not_implemented", description="Multi-signal ensemble decision engine")


class StatusResponse(BaseModel):
    """Schema for /api/status endpoint."""
    backend: BackendInfo
    modules: ModuleStatus
