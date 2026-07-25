"""Modelo de trabajo de escaneo."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.user import User
    from app.models.asset import Asset


class ScanStatusEnum(str, enum.Enum):
    """Estado del escaneo."""
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class ScanTypeEnum(str, enum.Enum):
    """Tipo de escaneo a ejecutar."""
    quick = "quick"
    full = "full"
    scheduled = "scheduled"
    stealth = "stealth"


class ScanJob(Base):
    """Trabajo de escaneo asincrónico via Celery."""

    __tablename__ = "scan_jobs"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    target: Mapped[str] = mapped_column(String(500), nullable=False, comment="IP, rango CIDR o hostname")
    scan_type: Mapped[ScanTypeEnum] = mapped_column(
        Enum(ScanTypeEnum, name="scan_type_enum"), nullable=False, default=ScanTypeEnum.quick
    )
    status: Mapped[ScanStatusEnum] = mapped_column(
        Enum(ScanStatusEnum, name="scan_status_enum"), nullable=False, default=ScanStatusEnum.pending
    )
    celery_task_id: Mapped[str | None] = mapped_column(String(155), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    # Relaciones
    asset: Mapped["Asset"] = relationship("Asset", back_populates="scan_jobs")

    def __repr__(self) -> str:
        return f"<ScanJob id={self.id} target={self.target!r} status={self.status}>"
