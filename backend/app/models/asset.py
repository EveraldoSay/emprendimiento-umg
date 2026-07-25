"""Modelo de Activo Digital."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List
from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.vulnerability import Vulnerability
    from app.models.scan_job import ScanJob


class AssetTypeEnum(str, enum.Enum):
    """Tipos de activos gestionados."""
    server = "server"
    vm = "vm"
    container = "container"
    endpoint = "endpoint"
    cloud_service = "cloud_service"
    network_device = "network_device"


class CriticalityEnum(str, enum.Enum):
    """Nivel de criticidad del activo."""
    alta = "alta"
    media = "media"
    baja = "baja"


class Asset(Base):
    """Activo digital perteneciente a una organización."""

    __tablename__ = "assets"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    asset_type: Mapped[AssetTypeEnum] = mapped_column(
        Enum(AssetTypeEnum, name="asset_type_enum"), nullable=False
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    hostname: Mapped[str | None] = mapped_column(String(253), nullable=True)
    operating_system: Mapped[str | None] = mapped_column(String(100), nullable=True)
    criticality: Mapped[CriticalityEnum] = mapped_column(
        Enum(CriticalityEnum, name="criticality_enum"), nullable=False, default=CriticalityEnum.media
    )
    sector_tag: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    last_scanned: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="assets")
    vulnerabilities: Mapped[List["Vulnerability"]] = relationship(
        "Vulnerability", back_populates="asset", lazy="noload"
    )
    scan_jobs: Mapped[List["ScanJob"]] = relationship("ScanJob", back_populates="asset", lazy="noload")

    def __repr__(self) -> str:
        return f"<Asset id={self.id} name={self.name!r} type={self.asset_type}>"
