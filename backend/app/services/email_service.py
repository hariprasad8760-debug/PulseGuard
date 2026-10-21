"""PulseGuard AI - Real Email Dispatch Service for OTP Password Reset."""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("pulseguard.email_service")


def send_otp_email(to_email: str, otp: str) -> Dict[str, Any]:
    """Dispatches a 4-digit OTP password reset email via SMTP/Gmail.

    OTP is valid for 5 minutes (enforced by the caller).
    """
    subject = "PulseGuard AI \u2014 Your Password Reset OTP"
    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME or "security@pulseguard.ai"
    from_header = f"{settings.SMTP_FROM_NAME} <{from_email}>"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
               background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
        .container {{ max-width: 520px; margin: 0 auto; background-color: #ffffff;
                      border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;
                      box-shadow: 0 4px 12px rgba(10,37,64,0.06); }}
        .header {{ background-color: #0A2540; padding: 28px 24px; text-align: center; color: #ffffff; }}
        .logo-title {{ font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin: 0; }}
        .logo-sub {{ font-size: 11px; font-weight: 600; color: #38bdf8;
                     text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }}
        .body {{ padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #334155; }}
        .otp-box {{ background-color: #0A2540; border-radius: 14px; padding: 20px 0;
                    text-align: center; margin: 24px 0; letter-spacing: 16px;
                    font-size: 42px; font-weight: 900; color: #38bdf8;
                    font-family: 'Courier New', monospace; }}
        .expiry {{ text-align: center; font-size: 12px; color: #64748b;
                   margin-top: -12px; margin-bottom: 20px; }}
        .footer {{ padding: 20px 28px; background-color: #f8fafc;
                   border-top: 1px solid #e2e8f0; font-size: 11px;
                   color: #64748b; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-title">PulseGuard AI</div>
          <div class="logo-sub">Real-Time Deepfake and Liveness Defense</div>
        </div>
        <div class="body">
          <h2 style="font-size: 18px; color: #0A2540; margin-top: 0;">Password Reset OTP</h2>
          <p>Hello,</p>
          <p>We received a password reset request for <strong>{to_email}</strong>.</p>
          <p>Enter the code below in the PulseGuard AI reset dialog.
             It is valid for <strong>5 minutes</strong>:</p>
          <div class="otp-box">{otp}</div>
          <p class="expiry">&#9201; This OTP expires in 5 minutes.</p>
          <p style="font-size: 12px; color: #64748b;">
            If you did not request a password reset, you can safely ignore this email.
            Your account remains completely secure.
          </p>
        </div>
        <div class="footer">
          &copy; PulseGuard AI &bull; Secure Video Calling &amp; Biometric Integrity Platform<br>
          This is an automated security transmission. Please do not reply.
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"""PulseGuard AI - Password Reset OTP

Hello,

Your password reset OTP for {to_email} is:

    {otp}

This code is valid for 5 minutes only.

If you did not request a reset, ignore this email.

-- PulseGuard AI Security Team
"""

    smtp_user = settings.SMTP_USERNAME.strip()
    smtp_pass = settings.SMTP_PASSWORD.strip()

    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_header
            msg["To"] = to_email
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10)
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg.as_string())
            server.quit()

            logger.info("OTP email dispatched successfully to: %s", to_email)
            return {
                "sent": True,
                "mode": "smtp_live",
                "message": f"OTP sent to {to_email} via Gmail SMTP."
            }
        except Exception as exc:
            logger.error("Failed to send OTP email to %s: %s", to_email, exc)
            return {
                "sent": False,
                "mode": "smtp_error",
                "error": str(exc),
                "message": f"SMTP error: {exc}"
            }
    else:
        # Dev mode — log OTP to backend console so developer can test
        logger.warning(
            "[DEV MODE] SMTP not configured. OTP for %s is: %s (valid 5 min)",
            to_email, otp
        )
        return {
            "sent": True,
            "mode": "dev_log",
            "message": (
                f"(Dev mode) SMTP not configured. OTP logged to backend console for {to_email}."
            )
        }


# ── Legacy alias kept so old imports do not break ──────────────────────────
def send_password_reset_email(to_email: str, reset_token: str) -> Dict[str, Any]:  # noqa: ARG001
    """Deprecated: OTP flow now used instead of reset-link flow."""
    return {
        "sent": False,
        "reset_url": "",
        "message": "Legacy reset-link flow has been replaced by the OTP flow."
    }
