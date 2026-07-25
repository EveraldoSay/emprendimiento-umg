"""Modelo de Sugerencia de Remediación con IA."""

import enum
import uuid
from typing import TYPE_CHECKING
from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.vulnerability import Vulnerability


class RemediationModeEnum(str, enum.Enum):
    """Modo de respuesta del LLM."""
    technical = "technical"    # Para analistas
    explain = "explain"        # Lenguaje simplificado para directivos


class AIRemediationSuggestion(Base):
    """Sugerencia de remediación generada por el LLM local (Ollama)."""

    __tablename__ = "ai_remediation_suggestions"

    vulnerability_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vulnerabilities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    response_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    suggestion_json: Mapped[str] = mapped_column(Text, nullable=False, comment="JSON con steps, severity, references")
    mode: Mapped[RemediationModeEnum] = mapped_column(
        Enum(RemediationModeEnum, name="remediation_mode_enum"),
        nullable=False,
        default=RemediationModeEnum.technical,
    )

    # Relaciones
    vulnerability: Mapped["Vulnerability"] = relationship("Vulnerability", back_populates="ai_suggestions")

    def __repr__(self) -> str:
        return f"<AIRemediationSuggestion id={self.id} model={self.model_used!r} mode={self.mode}>"
