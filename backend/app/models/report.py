"""Modelo de Reporte de cumplimiento."""

import enum
import uuid
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization


class ReportStandardEnum(str, enum.Enum):
    """Estándar de cumplimiento del reporte."""
    iso27001 = "iso27001"
    nist = "nist"
    cis = "cis"
    ley_gt = "ley_gt"


class ReportFormatEnum(str, enum.Enum):
    """Formato de salida del reporte."""
    pdf = "pdf"
    csv = "csv"
    json = "json"


class ReportStatusEnum(str, enum.Enum):
    """Estado de generación del reporte."""
    pending = "pending"
    generating = "generating"
    ready = "ready"
    failed = "failed"


class Report(Base):
    """Reporte de cumplimiento generado para una organización."""

    __tablename__ = "reports"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    standard: Mapped[ReportStandardEnum] = mapped_column(
        Enum(ReportStandardEnum, name="report_standard_enum"), nullable=False
    )
    format: Mapped[ReportFormatEnum] = mapped_column(
        Enum(ReportFormatEnum, name="report_format_enum"), nullable=False, default=ReportFormatEnum.pdf
    )
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[ReportStatusEnum] = mapped_column(
        Enum(ReportStatusEnum, name="report_status_enum"), nullable=False, default=ReportStatusEnum.pending
    )
    generated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    signed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    celery_task_id: Mapped[str | None] = mapped_column(String(155), nullable=True)

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="reports")

    def __repr__(self) -> str:
        return f"<Report id={self.id} title={self.title!r} status={self.status}>"
