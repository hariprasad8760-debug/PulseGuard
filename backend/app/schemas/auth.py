"""Authentication schemas for PulseGuard AI."""
from typing import Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """User profile data returned upon successful authentication."""
    name: str = Field(..., description="Display name of the user")
    email: str = Field(..., description="User email address")
    role: str = Field(default="Participant", description="User role in calls")


class LoginRequest(BaseModel):
    """User login request payload."""
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., min_length=6, description="Account password")


class RegisterRequest(BaseModel):
    """User registration request payload."""
    name: str = Field(..., min_length=2, max_length=60, description="Full name")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Account password")
    role: str = Field(default="Examiner / Call Host", description="Platform role")


class AuthResponse(BaseModel):
    """Authentication success response."""
    status: str = Field(default="success")
    token: str = Field(..., description="Bearer session token")
    user: UserProfile
    message: str = Field(default="Authentication successful")


class ForgotPasswordRequest(BaseModel):
    """Payload to request OTP password reset."""
    email: str = Field(..., description="Target Gmail or email address")


class ForgotPasswordResponse(BaseModel):
    """Response returned upon dispatching OTP email."""
    status: str = Field(default="success")
    email: str
    message: str
    sent: bool = Field(default=True)


class VerifyOtpRequest(BaseModel):
    """Payload to verify the 4-digit OTP."""
    email: str = Field(..., description="Email the OTP was sent to")
    otp: str = Field(..., min_length=4, max_length=4, description="4-digit OTP code")


class VerifyOtpResponse(BaseModel):
    """Response after OTP verification."""
    status: str = Field(default="success")
    message: str
    reset_token: str = Field(default="", description="Short-lived token to authorise password reset")


class ResetPasswordRequest(BaseModel):
    """Payload to apply new password with reset token."""
    token: str = Field(..., description="Reset authorisation token from OTP verification")
    new_password: str = Field(..., min_length=8, description="New strong password")


class ResetPasswordResponse(BaseModel):
    """Response returned upon password reset completion."""
    status: str = Field(default="success")
    message: str = Field(default="Password has been reset successfully.")
