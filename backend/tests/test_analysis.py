"""Automated tests for backend status and analysis contract endpoints."""
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_status_endpoint():
    """Verify GET /api/status accurately reflects current module implementation state."""
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "backend" in data
    assert data["backend"]["available"] is True
    assert "modules" in data
    modules = data["modules"]
    # In Step 2, face_detection is active while others remain not_implemented
    assert modules["face_detection"] in ("active", "initializing")
    assert modules["rppg"] == "not_implemented"
    assert modules["deepfake_detection"] == "not_implemented"
    assert modules["temporal_analysis"] == "not_implemented"
    assert modules["risk_assessment"] == "not_implemented"


def test_analyze_endpoint_returns_503_not_ready():
    """Verify POST /api/analyze validates schema and returns 503 not_ready."""
    payload = {
        "room_code": "PG-ABC123",
        "participant_id": "test_peer_1",
        "metadata": {"fps": 30}
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "not_ready"
    assert "AI analysis will be available" in data["message"]


def test_analyze_endpoint_payload_too_large():
    """Verify POST /api/analyze rejects oversized base64 frame data."""
    # Create fake base64 exceeding 5MB limit
    oversized_data = "A" * (6 * 1024 * 1024)
    payload = {
        "room_code": "PG-ABC123",
        "frame_base64": oversized_data
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 413
