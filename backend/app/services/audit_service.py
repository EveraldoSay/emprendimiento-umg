"""Servicio de registro de auditoría inmutable."""

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditService:
    """Registra acciones privilegiadas para cumplimiento ISO 27001 / NIST."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def log(
        self,
        organization_id: uuid.UUID,
        action: str,
        resource_type: str,
        ip_address: str,
        user_id: uuid.UUID | None = None,
        resource_id: str | None = None,
        details: dict[str, Any] | None = None,
        user_agent: str | None = None,
    ) -> AuditLog:
        """
        Crea un registro de auditoría inmutable.

        Args:
            organization_id: UUID del tenant.
            action: Código de la acción (ej. 'LOGIN', 'SCAN_CREATED').
            resource_type: Tipo de recurso afectado (ej. 'User', 'ScanJob').
            ip_address: IP del cliente que ejecutó la acción.
            user_id: UUID del usuario ejecutante (None para acciones del sistema).
            resource_id: UUID o identificador del recurso afectado.
            details: Metadatos adicionales en JSON.
            user_agent: User-Agent del cliente.
        """
        record = AuditLog(
            organization_id=organization_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            details=details or {},
            user_agent=user_agent,
        )
        self._db.add(record)
        await self._db.flush()
        return record
