"""Authentication API routes for PulseGuard AI."""
import random
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
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── In-memory account store seeded with demo credentials ──────────────────
DEMO_USERS: dict = {
    "dr.jane.doe@pulseguard.ai": {
        "name": "Dr. Jane Doe",
        "email": "dr.jane.doe@pulseguard.ai",
        "role": "Lead Examiner / Host",
        "password": "PulseGuard2026!",
    },
    "candidate.alex@example.com": {
        "name": "Alex Vance",
        "email": "candidate.alex@example.com",
        "role": "Candidate / Participant",
        "password": "SecureVerify2026#",
    },
}

# ── OTP store: email -> { otp, expires_at } ───────────────────────────────
# Expires after 5 minutes (300 seconds).
OTP_STORE: dict = {}

# ── Short-lived reset-authorisation tokens: token -> email ────────────────
# Granted only after OTP is verified; valid for 15 minutes.
VERIFIED_TOKENS: dict = {}


# ─────────────────────────────────────────────────────────────────────────
# LOGIN
# ─────────────────────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticates user credentials and returns session token.",
)
async def login(credentials: LoginRequest):
    email_key = credentials.email.lower()

    if email_key in DEMO_USERS:
        stored = DEMO_USERS[email_key]
        if stored["password"] != credentials.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials.",
            )
        display_name = stored["name"]
        user_role = stored["role"]
    else:
        if len(credentials.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters.",
            )
        local_name = credentials.email.split("@")[0]
        display_name = local_name.replace(".", " ").title()
        user_role = "Examiner / Call Host"

    token = f"pg_sec_{secrets.token_hex(16)}"
    return AuthResponse(
        status="success",
        token=token,
        user=UserProfile(name=display_name, email=credentials.email, role=user_role),
        message=f"Welcome back, {display_name}!",
    )


# ─────────────────────────────────────────────────────────────────────────
# REGISTER
# ─────────────────────────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User Registration",
    description="Creates a new account and returns session token.",
)
async def register(payload: RegisterRequest):
    email_key = payload.email.lower()
    DEMO_USERS[email_key] = {
        "name": payload.name.strip(),
        "email": payload.email,
        "role": payload.role,
        "password": payload.password,
    }
    token = f"pg_sec_{secrets.token_hex(16)}"
    return AuthResponse(
        status="success",
        token=token,
        user=UserProfile(
            name=payload.name.strip(), email=payload.email, role=payload.role
        ),
        message=f"Account created successfully for {payload.name}!",
    )


# ─────────────────────────────────────────────────────────────────────────
# FORGOT PASSWORD — generates 4-digit OTP and emails it
# ─────────────────────────────────────────────────────────────────────────
@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Forgot Password — Send OTP",
    description="Generates a 4-digit OTP valid for 5 minutes and sends it to the user's email.",
)
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required.",
        )

    # Generate 4-digit OTP (zero-padded)
    otp = f"{random.randint(0, 9999):04d}"
    expires_at = time.time() + 300  # 5 minutes

    OTP_STORE[email] = {"otp": otp, "expires_at": expires_at}

    result = send_otp_email(to_email=email, otp=otp)

    return ForgotPasswordResponse(
        status="success",
        email=email,
        sent=result.get("sent", True),
        message=result.get("message", f"OTP dispatched to {email}. Valid for 5 minutes."),
    )


# ─────────────────────────────────────────────────────────────────────────
# VERIFY OTP
# ─────────────────────────────────────────────────────────────────────────
@router.post(
    "/verify-otp",
    response_model=VerifyOtpResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify 4-digit OTP",
    description="Validates the OTP sent by email. Returns a short-lived reset token on success.",
)
async def verify_otp(req: VerifyOtpRequest):
    email = req.email.strip().lower()
    provided = req.otp.strip()

    record = OTP_STORE.get(email)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP was requested for this email. Please request a new OTP.",
        )

    if time.time() > record["expires_at"]:
        OTP_STORE.pop(email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This OTP has expired. Please request a new one.",
        )

    if provided != record["otp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect OTP. Please check your email and try again.",
        )

    # OTP valid — remove it (single-use) and issue a short-lived reset token
    OTP_STORE.pop(email, None)
    reset_token = f"rst_{secrets.token_urlsafe(24)}"
    VERIFIED_TOKENS[reset_token] = {"email": email, "expires_at": time.time() + 900}

    return VerifyOtpResponse(
        status="success",
        message="OTP verified. You may now set a new password.",
        reset_token=reset_token,
    )


# ─────────────────────────────────────────────────────────────────────────
# RESET PASSWORD — uses the verified reset token
# ─────────────────────────────────────────────────────────────────────────
@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset Password",
    description="Applies a new password using the token issued after OTP verification.",
)
async def reset_password(req: ResetPasswordRequest):
    token = req.token.strip()

    token_data = VERIFIED_TOKENS.get(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already-used reset token. Please request a new OTP.",
        )

    if time.time() > token_data["expires_at"]:
        VERIFIED_TOKENS.pop(token, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset token has expired. Please request a new OTP.",
        )

    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long.",
        )

    email = token_data["email"]
    if email in DEMO_USERS:
        DEMO_USERS[email]["password"] = req.new_password
    else:
        DEMO_USERS[email] = {
            "name": email.split("@")[0].title(),
            "email": email,
            "role": "Participant",
            "password": req.new_password,
        }

    # Invalidate the token (single-use)
    VERIFIED_TOKENS.pop(token, None)

    return ResetPasswordResponse(
        status="success",
        message="Your password has been updated successfully. You can now sign in.",
    )
