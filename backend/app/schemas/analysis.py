"""AI analysis contract schemas."""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Schema for incoming frame or session analysis request."""
    room_code: Optional[str] = Field(None, max_length=15, description="Room session identifier")
    participant_id: Optional[str] = Field(None, max_length=50, description="Participant identifier")
    frame_base64: Optional[str] = Field(None, description="Optional base64 encoded frame for future inference")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata such as FPS or timestamp")


class AnalyzeNotReadyResponse(BaseModel):
    """Schema for not-ready AI response (503 Service Unavailable)."""
    status: str = Field(default="not_ready", description="Status code indicating AI pipelines are in development")
    message: str = Field(
        default="AI analysis will be available after the detection modules are integrated.",
        description="User-friendly explanation"
    )
    supported_modules: Optional[List[str]] = Field(
        default=["face_detection", "rppg", "deepfake_detection", "temporal_analysis", "risk_assessment"],
        description="List of modules scheduled for subsequent steps"
    )
