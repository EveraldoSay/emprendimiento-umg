"""Dependencias FastAPI: autenticación, roles, feature flags."""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import RoleEnum, User
from app.models.feature_flag import FeatureName
from app.services.feature_flag_service import FeatureFlagService

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Security(security_scheme)],
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extrae y valida el JWT, retorna el usuario autenticado."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: RoleEnum):
    """Fábrica de dependencia que verifica que el usuario tenga uno de los roles indicados."""
    async def _check(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los roles: {[r.value for r in roles]}",
            )
        return current_user
    return Depends(_check)


def require_feature(feature: FeatureName):
    """Fábrica de dependencia que verifica que el tenant tenga el feature flag activo."""
    async def _check(
        current_user: CurrentUser,
        db: AsyncSession = Depends(get_db),
    ) -> User:
        service = FeatureFlagService(db)
        enabled = await service.is_enabled(
            organization_id=current_user.organization_id,
            feature=feature,
        )
        if not enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"La funcionalidad '{feature.value}' no está disponible en tu plan actual.",
            )
        return current_user
    return Depends(_check)
