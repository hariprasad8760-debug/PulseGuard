"""Automated tests for OpenCV and MediaPipe face detection API."""
import os
import base64
import cv2
import numpy as np
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_FACE_PATH = os.path.join(os.path.dirname(__file__), "sample_face.jpg")


def test_face_detect_multipart_with_face():
    """Verify face detection returns landmarks and bounding box on a real face image."""
    assert os.path.exists(SAMPLE_FACE_PATH), "sample_face.jpg must exist for face detection testing"
    with open(SAMPLE_FACE_PATH, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/api/face/detect",
        files={"file": ("sample_face.jpg", file_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["face_detected"] is True
    assert data["face_count"] >= 1
    assert len(data["faces"]) >= 1

    first_face = data["faces"][0]
    assert "bounding_box" in first_face
    bb = first_face["bounding_box"]
    assert 0.0 <= bb["x"] <= 1.0
    assert 0.0 <= bb["y"] <= 1.0
    assert 0.0 <= bb["width"] <= 1.0
    assert 0.0 <= bb["height"] <= 1.0
    assert first_face["landmark_count"] >= 400
    assert len(first_face["landmarks"]) >= 400


def test_face_detect_base64_payload():
    """Verify face detection accepts base64 encoded frame."""
    assert os.path.exists(SAMPLE_FACE_PATH)
    with open(SAMPLE_FACE_PATH, "rb") as f:
        b64_str = base64.b64encode(f.read()).decode("utf-8")

    response = client.post(
        "/api/face/detect",
        json={"frame_base64": f"data:image/jpeg;base64,{b64_str}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["face_detected"] is True


def test_face_detect_no_face_blank_image():
    """Verify image with no face returns face_detected: false without error."""
    # Create a 200x200 solid blue image
    blank = np.full((200, 200, 3), 128, dtype=np.uint8)
    _, buf = cv2.imencode(".jpg", blank)
    b64_str = base64.b64encode(buf.tobytes()).decode("utf-8")

    response = client.post(
        "/api/face/detect",
        json={"frame_base64": b64_str}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["face_detected"] is False
    assert data["face_count"] == 0
    assert data["faces"] == []


def test_face_detect_unsupported_file_type():
    """Verify unsupported file type returns 415."""
    response = client.post(
        "/api/face/detect",
        files={"file": ("test.txt", b"plain text content", "text/plain")}
    )
    assert response.status_code == 415


def test_face_detect_corrupted_image():
    """Verify invalid/corrupted image bytes return 400."""
    response = client.post(
        "/api/face/detect",
        files={"file": ("corrupt.jpg", b"not-a-valid-image", "image/jpeg")}
    )
    assert response.status_code == 400


def test_face_detect_oversized_payload():
    """Verify oversized payload returns 413."""
    oversized = "A" * (6 * 1024 * 1024)
    response = client.post(
        "/api/face/detect",
        json={"frame_base64": oversized}
    )
    assert response.status_code == 413
