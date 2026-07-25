"""Servicio de autenticación: login, 2FA, JWT, refresh, logout."""

import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_otp,
    hash_password,
    verify_password,
)
from app.models.otp_token import OTPToken
from app.models.refresh_token import RefreshToken
from app.models.user import User


def _hash_token(token: str) -> str:
    """Genera hash SHA-256 del refresh token para almacenamiento seguro."""
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    """Lógica de negocio para autenticación Zero Trust."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def initiate_login(
        self, email: str, password: str, request: Request
    ) -> dict:
        """
        Primer factor: valida credenciales y genera OTP.
        Retorna un mensaje de confirmación (nunca el OTP directamente).
        """
        result = await self._db.execute(
            select(User).where(User.email == email.lower())
        )
        user = result.scalar_one_or_none()

        # Conteo de intentos fallidos contra timing attacks
        if user is None or not verify_password(password, user.password_hash):
            if user is not None:
                user.failed_attempts += 1
                if user.failed_attempts >= 5:
                    user.is_active = False
                await self._db.flush()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cuenta bloqueada. Contacta al administrador.",
            )

        # Resetear contador de intentos fallidos
        user.failed_attempts = 0

        # Generar OTP y persistir
        otp_code = generate_otp()
        expires = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        otp_record = OTPToken(
            user_id=user.id,
            token=otp_code,
            expires_at=expires,
        )
        self._db.add(otp_record)
        await self._db.flush()

        # Retornar OTP para que el servicio de email lo envíe
        return {"user_id": user.id, "email": user.email, "otp_code": otp_code}

    async def verify_otp_and_issue_tokens(
        self, user_id: uuid.UUID, otp_code: str, request: Request
    ) -> dict:
        """
        Segundo factor: valida OTP y emite access + refresh token.
        """
        result = await self._db.execute(
            select(OTPToken)
            .where(
                OTPToken.user_id == user_id,
                OTPToken.token == otp_code.upper(),
                OTPToken.used.is_(False),
                OTPToken.expires_at > datetime.now(timezone.utc),
            )
            .order_by(OTPToken.created_at.desc())
            .limit(1)
        )
        otp_record = result.scalar_one_or_none()

        if otp_record is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Código OTP inválido o expirado",
            )

        # Marcar OTP como usado
        otp_record.used = True

        # Obtener usuario
        user_result = await self._db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one()

        # Registrar IP del login
        client_ip = request.client.host if request.client else "unknown"
        user.last_login = datetime.now(timezone.utc)
        user.last_known_ip = client_ip

        # Generar tokens
        access_token = create_access_token(
            subject=user.id,
            extra_claims={"role": user.role.value, "org": str(user.organization_id)},
        )
        refresh_token = create_refresh_token(subject=user.id)

        # Persistir refresh token (hash)
        rt_record = RefreshToken(
            user_id=user.id,
            token_hash=_hash_token(refresh_token),
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        self._db.add(rt_record)
        await self._db.flush()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def refresh_access_token(self, refresh_token: str) -> dict:
        """Valida el refresh token y emite un nuevo access token."""
        from app.core.security import decode_token
        from jose import JWTError

        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
            user_id = uuid.UUID(payload["sub"])
        except (JWTError, KeyError, ValueError):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

        token_hash = _hash_token(refresh_token)
        result = await self._db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked.is_(False),
                RefreshToken.expires_at > datetime.now(timezone.utc),
            )
        )
        rt_record = result.scalar_one_or_none()

        if rt_record is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión expirada o revocada")

        user_result = await self._db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user is None or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo")

        access_token = create_access_token(
            subject=user.id,
            extra_claims={"role": user.role.value, "org": str(user.organization_id)},
        )
        return {"access_token": access_token, "token_type": "bearer"}

    async def logout(self, user_id: uuid.UUID, refresh_token: str) -> None:
        """Revoca el refresh token activo del usuario."""
        token_hash = _hash_token(refresh_token)
        result = await self._db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.token_hash == token_hash,
            )
        )
        rt_record = result.scalar_one_or_none()
        if rt_record:
            rt_record.revoked = True

    async def list_active_sessions(self, organization_id: uuid.UUID) -> list:
        """Retorna las sesiones activas de todos los usuarios de la organización."""
        result = await self._db.execute(
            select(RefreshToken, User)
            .join(User, RefreshToken.user_id == User.id)
            .where(
                User.organization_id == organization_id,
                RefreshToken.revoked.is_(False),
                RefreshToken.expires_at > datetime.now(timezone.utc),
            )
        )
        return result.all()

    async def revoke_session(self, session_id: uuid.UUID) -> None:
        """Revoca una sesión específica por ID de refresh token."""
        result = await self._db.execute(
            select(RefreshToken).where(RefreshToken.id == session_id)
        )
        rt = result.scalar_one_or_none()
        if rt is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")
        rt.revoked = True
