"""Servicio de envío de correo electrónico (SMTP) para OTP y notificaciones."""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


class EmailService:
    """Cliente SMTP para enviar correos institucionales."""

    def _build_otp_html(self, otp_code: str, user_name: str) -> str:
        """Genera el HTML del correo de OTP."""
        return f"""
        <!DOCTYPE html>
        <html lang="es">
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px;
                      padding: 32px; border-top: 4px solid #1a56db;">
            <h2 style="color: #1a56db;">🔐 Código de Verificación</h2>
            <p>Hola <strong>{user_name}</strong>,</p>
            <p>Tu código de acceso de un solo uso es:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                           color: #1a56db; background: #eff6ff; padding: 12px 24px;
                           border-radius: 8px; display: inline-block;">
                {otp_code}
              </span>
            </div>
            <p style="color: #6b7280;">Este código vence en <strong>10 minutos</strong>.</p>
            <p style="color: #6b7280;">Si no solicitaste este código, ignora este mensaje.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="font-size: 12px; color: #9ca3af;">
              CyberSec AI Platform — Guatemala<br>
              Este es un mensaje automático, no respondas a este correo.
            </p>
          </div>
        </body>
        </html>
        """

    def send_otp(self, to_email: str, otp_code: str, user_name: str = "Usuario") -> None:
        """Envía el código OTP al correo institucional del usuario."""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🔐 Tu código de verificación — CyberSec AI"
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email

        html_part = MIMEText(self._build_otp_html(otp_code, user_name), "html", "utf-8")
        msg.attach(html_part)

        try:
            if settings.SMTP_TLS:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.ehlo()
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
            else:
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        except smtplib.SMTPException as exc:
            # Log del error sin incluir credenciales
            raise RuntimeError(f"Error al enviar correo a {to_email}: {type(exc).__name__}") from exc
