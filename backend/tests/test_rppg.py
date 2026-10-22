"""Tests for rPPG Pulse Estimation Service and API (Step 3C).

Covers:
- Model initialization and checkpoint loading
- Input validation and empty/insufficient frame handling
- Synthetic video sequence inference test (clearly distinguished from real video)
- HTTP API endpoints POST /api/rppg/analyze and GET /api/status
"""
import base64
import numpy as np
import cv2
import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.rppg_service import rppg_service

client = TestClient(app)


def generate_synthetic_frame_b64(width=64, height=64, color=(180, 140, 120)):
    """Generates a synthetic single-color image in base64 format for unit testing."""
    img = np.full((height, width, 3), color, dtype=np.uint8)
    _, buf = cv2.imencode('.jpg', img)
    return base64.b64encode(buf.tobytes()).decode('utf-8')


def test_rppg_service_initialization():
    """Verify PhysNet model loads checkpoint and enters 'ready' state."""
    initialized = rppg_service.initialize()
    assert initialized is True
    assert rppg_service.is_initialized is True
    assert rppg_service.get_status() == "ready"
    assert rppg_service.model is not None


def test_rppg_status_endpoint():
    """Verify GET /api/status reflects that rPPG module is ready."""
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["modules"]["rppg"] == "ready"


def test_rppg_analyze_empty_payload():
    """Verify API returns 400 when frames list is empty."""
    response = client.post("/api/rppg/analyze", json={"frames": []})
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"]


def test_rppg_analyze_insufficient_frames():
    """Verify service returns insufficient_data status when fewer than 16 frames provided."""
    frames = [{"frame_base64": generate_synthetic_frame_b64()} for _ in range(5)]
    response = client.post("/api/rppg/analyze", json={"frames": frames})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "insufficient_data"
    assert data["signal_available"] is False
    assert data["heart_rate_bpm"] is None
    assert data["signal_quality"] == "unavailable"
    assert "Insufficient frames" in data["message"]
    assert data["frames_processed"] == 5


def test_rppg_synthetic_inference_pipeline():
    """Synthetic inference test: feeds 20 synthetic frames through the real PhysNet 3D-CNN.
    
    NOTE: This is a synthetic sanity test to verify model forward-pass execution,
    temporal interpolation, waveform extraction, and response schema.
    It does NOT represent real-video pulse estimation accuracy.
    """
    frames = [
        {
            "frame_base64": generate_synthetic_frame_b64(
                color=(170 + (i % 5) * 4, 130 + (i % 5) * 3, 110 + (i % 5) * 2)
            ),
            "timestamp_ms": 1000.0 + i * 100.0
        }
        for i in range(20)
    ]
    response = client.post("/api/rppg/analyze", json={"frames": frames, "fps": 10.0})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "signal_available" in data
    assert "signal_quality" in data
    assert data["frames_processed"] == 20
    assert data["effective_fps"] > 0
    assert isinstance(data["waveform"], list)
    assert len(data["waveform"]) > 0
    # Verify scientific limitation disclaimer
    assert "scientific_note" in data
    assert "does not mean fake" in data["scientific_note"]
