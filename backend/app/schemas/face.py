"""Face detection and landmark schemas."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Normalized bounding box coordinates (0.0 to 1.0)."""
    x: float = Field(..., description="Top-left X coordinate normalized")
    y: float = Field(..., description="Top-left Y coordinate normalized")
    width: float = Field(..., description="Width normalized")
    height: float = Field(..., description="Height normalized")


class LandmarkPoint(BaseModel):
    """Normalized 3D facial landmark coordinate."""
    x: float
    y: float
    z: float


class KeyRegions(BaseModel):
    """Key facial regions identified for pulse and liveness analysis."""
    forehead: Optional[Dict[str, float]] = None
    left_cheek: Optional[Dict[str, float]] = None
    right_cheek: Optional[Dict[str, float]] = None
    nose_tip: Optional[Dict[str, float]] = None


class FaceItem(BaseModel):
    """Details for a single detected face."""
    bounding_box: BoundingBox
    landmark_count: int
    landmarks: List[LandmarkPoint] = Field(default_factory=list)
    key_regions: Optional[KeyRegions] = None


class FaceDetectResponse(BaseModel):
    """Response schema for POST /api/face/detect."""
    status: str = Field(default="success")
    face_detected: bool = Field(...)
    face_count: int = Field(default=0)
    faces: List[FaceItem] = Field(default_factory=list)
    message: Optional[str] = None
    timestamp: Optional[float] = None


class FaceDetectRequest(BaseModel):
    """Optional JSON body schema for base64 encoded frame input."""
    frame_base64: str = Field(..., description="Base64 encoded JPEG or PNG image")
    room_code: Optional[str] = None
