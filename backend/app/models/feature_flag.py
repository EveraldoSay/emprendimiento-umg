"""Modelo de Feature Flag por organización."""

import enum
import uuid
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization


class FeatureName(str, enum.Enum):
    """Features controlables por plan."""
    ai_remediation = "ai_remediation"
    xdr = "xdr"
    auto_remediation = "auto_remediation"
    dedicated_infra = "dedicated_infra"
    advanced_compliance = "advanced_compliance"


class FeatureFlag(Base):
    """Feature flag granular por tenant."""

    __tablename__ = "feature_flags"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    feature: Mapped[FeatureName] = mapped_column(
        Enum(FeatureName, name="feature_name_enum"), nullable=False
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="feature_flags")

    def __repr__(self) -> str:
        return f"<FeatureFlag org={self.organization_id} feature={self.feature} enabled={self.enabled}>"
