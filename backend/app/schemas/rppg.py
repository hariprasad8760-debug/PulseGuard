"""PulseGuard AI - rPPG Analysis Schemas."""
from typing import List, Optional
from pydantic import BaseModel, Field


class RPPGFrameItem(BaseModel):
    """Timestamped cropped facial ROI or full frame in base64 format."""
    frame_base64: str = Field(..., description="Base64 encoded JPEG or PNG image")
    timestamp_ms: Optional[float] = Field(None, description="Client capture timestamp in milliseconds")


class RPPGAnalyzeRequest(BaseModel):
    """Request payload for multi-frame rPPG pulse estimation."""
    frames: List[RPPGFrameItem] = Field(..., description="Sequence of face frames")
    fps: Optional[float] = Field(default=None, description="Effective frame rate of captured sequence")
    session_id: Optional[str] = Field(default=None, description="Optional room or call identifier")


class RPPGAnalyzeResponse(BaseModel):
    """Structured response for rPPG pulse signal analysis."""
    status: str = Field(..., description="Status of the analysis: success, insufficient_data, error")
    signal_available: bool = Field(..., description="Whether a valid rPPG pulse signal could be extracted")
    heart_rate_bpm: Optional[float] = Field(None, description="Estimated heart rate in beats per minute, or null if unreliable")
    signal_quality: str = Field(..., description="Qualitative SNR assessment: high, medium, low, unavailable")
    snr_db: Optional[float] = Field(None, description="Signal-to-noise ratio in decibels")
    confidence: Optional[float] = Field(None, description="Confidence metric in [0, 1] based on spectral prominence")
    waveform: Optional[List[float]] = Field(None, description="Normalized extracted rPPG waveform segment (resampled)")
    frames_processed: int = Field(0, description="Number of frames processed by the model")
    effective_fps: float = Field(0.0, description="Calculated sampling rate used for spectral analysis")
    scientific_note: str = Field(
        default="Pulse estimation is physiological evidence only. Unavailable signal does not mean fake; estimated pulse does not prove real.",
        description="Scientific limitations notice"
    )
    message: str = Field(..., description="Human-readable summary of the analysis result")
