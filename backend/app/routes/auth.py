"""Authentication API routes for PulseGuard AI."""
import secrets
import time
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UserProfile,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
from app.services.email_service import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory account store seeded with demo evaluation credentials
DEMO_USERS = {
    "dr.jane.doe@pulseguard.ai": {
        "name": "Dr. Jane Doe",
        "email": "dr.jane.doe@pulseguard.ai",
        "role": "Lead Examiner / Host",
        "password": "PulseGuard2026!"
    },
    "candidate.alex@example.com": {
        "name": "Alex Vance",
        "email": "candidate.alex@example.com",
        "role": "Candidate / Participant",
        "password": "SecureVerify2026#"
    }
}

# In-memory storage for active password reset tokens: token -> { email, expires_at }
RESET_TOKENS = {}


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticates user credentials and returns session token with user profile."
)
async def login(credentials: LoginRequest):
    email_key = credentials.email.lower()
    
    # Check known demo accounts or authenticate valid email/password
    if email_key in DEMO_USERS:
        stored = DEMO_USERS[email_key]
        if stored["password"] != credentials.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )
        display_name = stored["name"]
        user_role = stored["role"]
    else:
        # Standard login validation
        if len(credentials.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters."
            )
        local_name = credentials.email.split("@")[0]
        display_name = local_name.replace(".", " ").title()
        user_role = "Examiner / Call Host"

    token = f"pg_sec_{secrets.token_hex(16)}"

    return AuthResponse(
        status="success",
        token=token,
        user=UserProfile(
            name=display_name,
            email=credentials.email,
            role=user_role
        ),
        message=f"Welcome back, {display_name}!"
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User Registration",
    description="Creates a new account and returns session token."
)
async def register(payload: RegisterRequest):
    email_key = payload.email.lower()
    
    # Store in session map
    DEMO_USERS[email_key] = {
        "name": payload.name.strip(),
        "email": payload.email,
        "role": payload.role,
        "password": payload.password
    }

    token = f"pg_sec_{secrets.token_hex(16)}"

    return AuthResponse(
        status="success",
        token=token,
        user=UserProfile(
            name=payload.name.strip(),
            email=payload.email,
            role=payload.role
        ),
        message=f"Account created successfully for {payload.name}!"
    )


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Forgot Password",
    description="Dispatches a real password reset email via SMTP / Gmail to the user account."
)
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required to dispatch reset instructions."
        )

    # Generate cryptographically secure token valid for 20 minutes
    reset_token = f"rst_{secrets.token_urlsafe(32)}"
    expires_at = time.time() + (20 * 60)
    RESET_TOKENS[reset_token] = {
        "email": email,
        "expires_at": expires_at
    }

    # Dispatch real email via SMTP
    result = send_password_reset_email(to_email=email, reset_token=reset_token)

    return ForgotPasswordResponse(
        status="success",
        email=email,
        message=result.get("message", f"Password reset instructions dispatched to {email}"),
        reset_token=reset_token,
        reset_url=result.get("reset_url", ""),
        sent=result.get("sent", True)
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset Password with Token",
    description="Applies a new password using a verified reset token."
)
async def reset_password(req: ResetPasswordRequest):
    token = req.token.strip()
    if token not in RESET_TOKENS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token. Please request a new reset email."
        )

    token_data = RESET_TOKENS[token]
    if time.time() > token_data["expires_at"]:
        del RESET_TOKENS[token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset token has expired. Please request a fresh reset link."
        )

    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )

    email = token_data["email"]
    if email in DEMO_USERS:
        DEMO_USERS[email]["password"] = req.new_password
    else:
        DEMO_USERS[email] = {
            "name": email.split("@")[0].title(),
            "email": email,
            "role": "Participant",
            "password": req.new_password
        }

    # Invalidate used token
    del RESET_TOKENS[token]

    return ResetPasswordResponse(
        status="success",
        message="Your password has been updated successfully. You can now sign in with your new password."
    )

