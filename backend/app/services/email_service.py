"""PulseGuard AI - Real Email Dispatch Service for Password Reset."""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("pulseguard.email_service")


def send_password_reset_email(to_email: str, reset_token: str) -> Dict[str, Any]:
    """Dispatches a real password reset email to a user's Gmail / email account.
    
    Uses standard SMTP over TLS (e.g. Gmail smtp.gmail.com:587).
    """
    reset_url = f"{settings.FRONTEND_URL}/?reset_token={reset_token}&email={to_email}"
    
    subject = "PulseGuard AI — Password Reset Request"
    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME or "security@pulseguard.ai"
    from_header = f"{settings.SMTP_FROM_NAME} <{from_email}>"

    # HTML Email content matching PulseGuard AI Deep Sea Blue theme
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(10,37,64,0.06); }}
        .header {{ background-color: #0A2540; padding: 28px 24px; text-align: center; color: #ffffff; }}
        .logo-title {{ font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin: 0; }}
        .logo-sub {{ font-size: 11px; font-weight: 600; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }}
        .body {{ padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #334155; }}
        .btn {{ display: inline-block; background-color: #003B73; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; margin: 20px 0; }}
        .token-box {{ background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 13px; color: #0A2540; word-break: break-all; margin-top: 12px; }}
        .footer {{ padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-title">PulseGuard AI</div>
          <div class="logo-sub">Real-Time Deepfake and Liveness Defense</div>
        </div>
        <div class="body">
          <h2 style="font-size: 18px; color: #0A2540; margin-top: 0;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your PulseGuard AI account associated with <strong>{to_email}</strong>.</p>
          <p>Click the secure button below to set a new password:</p>
          <div style="text-align: center;">
            <a href="{reset_url}" class="btn" target="_blank">Reset My Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this link into your browser:</p>
          <div class="token-box">{reset_url}</div>
          <p style="margin-top: 24px; font-size: 12px; color: #64748b;">If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.</p>
        </div>
        <div class="footer">
          &copy; PulseGuard AI &bull; Secure Video Calling & Biometric Integrity Platform<br>
          This is an automated security transmission. Please do not reply directly.
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"""PulseGuard AI - Password Reset Request

Hello,

We received a request to reset your password for: {to_email}

Open this link in your browser to reset your password:
{reset_url}

If you did not request this reset, you can safely ignore this email.

-- PulseGuard AI Security Team
"""

    # If SMTP is configured, send the real email via Gmail / SMTP server
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

            logger.info("Real password reset email dispatched successfully to: %s", to_email)
            return {
                "sent": True,
                "mode": "smtp_live",
                "email": to_email,
                "reset_url": reset_url,
                "message": f"Password reset email dispatched to {to_email} via Gmail SMTP."
            }
        except Exception as exc:
            logger.error("Failed to send email via SMTP to %s: %s", to_email, exc)
            return {
                "sent": False,
                "mode": "smtp_error",
                "error": str(exc),
                "email": to_email,
                "reset_url": reset_url,
                "message": f"SMTP connection error: {exc}. Reset link generated for instant recovery."
            }
    else:
        logger.info("SMTP credentials not configured in backend/.env. Simulated reset URL: %s", reset_url)
        return {
            "sent": True,
            "mode": "development_link",
            "email": to_email,
            "reset_url": reset_url,
            "message": f"Reset link generated for {to_email}. (To dispatch via real Gmail inbox, configure SMTP_USERNAME and SMTP_PASSWORD in backend/.env)."
        }
