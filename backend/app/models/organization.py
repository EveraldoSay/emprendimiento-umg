"""Modelo de Organización (Tenant)."""

import enum
from typing import TYPE_CHECKING, List
from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.asset import Asset
    from app.models.feature_flag import FeatureFlag
    from app.models.report import Report
    from app.models.audit_log import AuditLog


class SectorEnum(str, enum.Enum):
    """Sectores de los clientes."""
    hospital = "hospital"
    gobierno = "gobierno"
    banca = "banca"
    pyme = "pyme"
    otro = "otro"


class PlanEnum(str, enum.Enum):
    """Planes de suscripción disponibles."""
    standard = "standard"
    premium = "premium"
    enterprise = "enterprise"


class Organization(Base):
    """Representa a un cliente (tenant) de la plataforma."""

    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sector: Mapped[SectorEnum] = mapped_column(
        Enum(SectorEnum, name="sector_enum"), nullable=False, default=SectorEnum.pyme
    )
    plan: Mapped[PlanEnum] = mapped_column(
        Enum(PlanEnum, name="plan_enum"), nullable=False, default=PlanEnum.standard
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relaciones
    users: Mapped[List["User"]] = relationship("User", back_populates="organization", lazy="noload")
    assets: Mapped[List["Asset"]] = relationship("Asset", back_populates="organization", lazy="noload")
    feature_flags: Mapped[List["FeatureFlag"]] = relationship("FeatureFlag", back_populates="organization", lazy="noload")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="organization", lazy="noload")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="organization", lazy="noload")

    def __repr__(self) -> str:
        return f"<Organization id={self.id} name={self.name!r} plan={self.plan}>"
