"""Modelo de Log de Auditoría."""

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization


class AuditLog(Base):
    """Registro inmutable de acciones privilegiadas para cumplimiento ISO 27001."""

    __tablename__ = "audit_logs"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False, default="")
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog action={self.action!r} resource={self.resource_type} user_id={self.user_id}>"
