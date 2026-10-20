"""Automated tests for health check and status endpoints."""
import pytest
from starlette.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_root_endpoint():
    """Verify root endpoint provides basic navigation info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["application"] == "PulseGuard AI"
    assert "health" in data


def test_health_endpoint():
    """Verify GET /api/health returns exact required contract."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["application"] == "PulseGuard AI"
    assert data["version"] == "1.0.0"
    assert data["backend"] == "fastapi"


def test_cors_headers():
    """Verify CORS headers respond to configured origins."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    }
    response = client.options("/api/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
