"""Rutas de autenticación: login 2FA, refresh, logout, sesiones."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser
from app.db.session import get_db
from app.models.user import RoleEnum
from app.services.auth_service import AuthService
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


# --- Schemas ---

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OTPVerifyRequest(BaseModel):
    user_id: uuid.UUID
    otp_code: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Endpoints ---

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(
    body: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Primer factor de autenticación.
    Valida email y contraseña, envía OTP al correo del usuario.
    """
    service = AuthService(db)
    result = await service.initiate_login(
        email=body.email,
        password=body.password,
        request=request,
    )

    # Enviar OTP por correo (en background para no bloquear)
    try:
        EmailService().send_otp(
            to_email=result["email"],
            otp_code=result["otp_code"],
        )
    except RuntimeError:
        # Si el email falla, no exponemos el OTP por seguridad
        pass

    return {
        "message": "Código de verificación enviado a tu correo institucional.",
        "user_id": str(result["user_id"]),
    }


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(
    body: OTPVerifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Segundo factor de autenticación.
    Valida el OTP y retorna access_token + refresh_token.
    """
    service = AuthService(db)
    tokens = await service.verify_otp_and_issue_tokens(
        user_id=body.user_id,
        otp_code=body.otp_code,
        request=request,
    )
    return tokens


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_token(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Renueva el access token usando un refresh token válido."""
    service = AuthService(db)
    return await service.refresh_access_token(body.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: LogoutRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Revoca el refresh token activo del usuario (cierra sesión)."""
    service = AuthService(db)
    await service.logout(user_id=current_user.id, refresh_token=body.refresh_token)


@router.get("/sessions")
async def list_sessions(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Lista las sesiones activas de la organización. Solo Admin."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    service = AuthService(db)
    sessions = await service.list_active_sessions(current_user.organization_id)
    return [
        {
            "session_id": str(rt.id),
            "user_email": user.email,
            "ip_address": rt.ip_address,
            "user_agent": rt.user_agent,
            "expires_at": rt.expires_at.isoformat(),
        }
        for rt, user in sessions
    ]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_session(
    session_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Revoca una sesión específica por ID. Solo Admin."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")
    service = AuthService(db)
    await service.revoke_session(session_id)


@router.get("/me")
async def get_me(current_user: CurrentUser):
    """Retorna el perfil del usuario autenticado."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "organization_id": str(current_user.organization_id),
        "mfa_enabled": current_user.mfa_enabled,
    }
