"""Automated tests for PulseGuard AI authentication endpoints."""
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_demo_account_success():
    """Verify demo examiner login succeeds."""
    payload = {
        "email": "dr.jane.doe@pulseguard.ai",
        "password": "PulseGuard2026!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "token" in data
    assert data["user"]["name"] == "Dr. Jane Doe"
    assert data["user"]["role"] == "Lead Examiner / Host"


def test_login_demo_account_invalid_password():
    """Verify invalid password for demo account returns 401."""
    payload = {
        "email": "dr.jane.doe@pulseguard.ai",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_register_and_login_new_user():
    """Verify registration creates account and allows subsequent login."""
    reg_payload = {
        "name": "Sarah Connor",
        "email": "sarah.connor@cyberdyne.org",
        "password": "TerminatorFree2026!",
        "role": "Security / Compliance Analyst"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["status"] == "success"
    assert reg_data["user"]["name"] == "Sarah Connor"
    assert reg_data["user"]["role"] == "Security / Compliance Analyst"

    # Login with new credentials
    login_payload = {
        "email": "sarah.connor@cyberdyne.org",
        "password": "TerminatorFree2026!"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert login_res.json()["user"]["name"] == "Sarah Connor"


def test_register_invalid_short_password():
    """Verify registration with password < 8 characters returns 422 Unprocessable Entity."""
    reg_payload = {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "short",
        "role": "Participant"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 422


def test_forgot_and_reset_password_flow():
    """Verify forgot password generates OTP, verifies OTP, and allows resetting password."""
    from app.routes.auth import OTP_STORE

    # 1. Request password reset (dispatches 4-digit OTP)
    forgot_payload = {"email": "dr.jane.doe@pulseguard.ai"}
    forgot_res = client.post("/api/auth/forgot-password", json=forgot_payload)
    assert forgot_res.status_code == 200
    forgot_data = forgot_res.json()
    assert forgot_data["status"] == "success"
    assert "dr.jane.doe@pulseguard.ai" in OTP_STORE
    otp = OTP_STORE["dr.jane.doe@pulseguard.ai"]["otp"]

    # 2. Verify OTP
    verify_res = client.post("/api/auth/verify-otp", json={
        "email": "dr.jane.doe@pulseguard.ai",
        "otp": otp
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["status"] == "success"
    assert "reset_token" in verify_data
    token = verify_data["reset_token"]

    # 3. Reset password using valid token
    reset_payload = {
        "token": token,
        "new_password": "BrandNewSecret2026#"
    }
    reset_res = client.post("/api/auth/reset-password", json=reset_payload)
    assert reset_res.status_code == 200
    assert reset_res.json()["status"] == "success"

    # 4. Login with updated password
    login_payload = {
        "email": "dr.jane.doe@pulseguard.ai",
        "password": "BrandNewSecret2026#"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert login_res.json()["user"]["name"] == "Dr. Jane Doe"

