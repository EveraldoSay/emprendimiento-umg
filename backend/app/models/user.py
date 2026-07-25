"""Modelo de Usuario."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.otp_token import OTPToken
    from app.models.refresh_token import RefreshToken


class RoleEnum(str, enum.Enum):
    """Roles RBAC de la plataforma."""
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"
    auditor = "auditor"
    superadmin = "superadmin"


class User(Base):
    """Usuario de la plataforma con autenticación 2FA."""

    __tablename__ = "users"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(60), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum, name="role_enum"), nullable=False, default=RoleEnum.viewer
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    failed_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_known_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")
    otp_tokens: Mapped[List["OTPToken"]] = relationship("OTPToken", back_populates="user", lazy="noload")
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship("RefreshToken", back_populates="user", lazy="noload")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"
