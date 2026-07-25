"""Motor de remediación con IA: genera planes de acción usando el LLM local."""

import json
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_suggestion import AIRemediationSuggestion, RemediationModeEnum
from app.models.vulnerability import Vulnerability
from app.models.asset import Asset
from app.services.ai.ollama_service import OllamaService

_TECHNICAL_SYSTEM_PROMPT = """Eres un experto en ciberseguridad con certificaciones OSCP, CISSP y CEH.
Responde SIEMPRE con un JSON válido con esta estructura exacta:
{
  "severity_assessment": "string (evaluación del riesgo real)",
  "immediate_actions": ["string"],
  "remediation_steps": ["string (paso detallado con comandos si aplica)"],
  "references": ["CVE-XXXX-XXXX", "https://..."],
  "estimated_effort": "string (ej: 2 horas, 1 día)",
  "verification_steps": ["string"]
}
No incluyas texto fuera del JSON."""

_EXPLAIN_SYSTEM_PROMPT = """Eres un consultor de ciberseguridad que explica riesgos a directivos no técnicos.
Responde SIEMPRE con un JSON válido con esta estructura exacta:
{
  "business_risk": "string (impacto en términos de negocio)",
  "what_happened": "string (explicación simple)",
  "what_to_do": ["string (acción clara sin jerga técnica)"],
  "urgency": "Inmediata | Esta semana | Este mes",
  "who_should_act": "string (departamento o persona responsable)"
}
No incluyas texto fuera del JSON."""


class RemediationService:
    """Orquesta la generación de sugerencias de remediación con IA local."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._ollama = OllamaService()

    def _build_prompt(self, vuln: Vulnerability, asset: Asset, mode: RemediationModeEnum) -> str:
        """Construye el prompt con contexto completo de la vulnerabilidad."""
        base = f"""VULNERABILIDAD DETECTADA:
- CVE: {vuln.cve_id or 'N/A'}
- Título: {vuln.title}
- Severidad: {vuln.severity.value.upper()} (CVSS: {vuln.cvss_score or 'N/A'})
- Descripción: {vuln.description}
- Componente afectado: {vuln.affected_component or 'N/A'}

ACTIVO AFECTADO:
- Nombre: {asset.name}
- Tipo: {asset.asset_type.value}
- Sistema Operativo: {asset.operating_system or 'N/A'}
- Criticidad: {asset.criticality.value.upper()}
- IP/Host: {asset.ip_address or asset.hostname or 'N/A'}
"""
        if mode == RemediationModeEnum.technical:
            return base + "\nGenera el plan de remediación técnico detallado."
        return base + "\nExplica el riesgo y las acciones a tomar para la dirección ejecutiva."

    async def generate_suggestion(
        self,
        vulnerability_id: uuid.UUID,
        mode: RemediationModeEnum = RemediationModeEnum.technical,
        model: str | None = None,
    ) -> AIRemediationSuggestion:
        """
        Genera y persiste una sugerencia de remediación para la vulnerabilidad dada.

        Args:
            vulnerability_id: UUID de la vulnerabilidad a remediar.
            mode: 'technical' para analistas, 'explain' para directivos.
            model: Modelo LLM a usar. Por defecto usa el configurado en settings.

        Returns:
            El registro AIRemediationSuggestion creado.
        """
        # Cargar vulnerabilidad con su activo
        vuln_result = await self._db.execute(
            select(Vulnerability).where(Vulnerability.id == vulnerability_id)
        )
        vuln = vuln_result.scalar_one_or_none()
        if vuln is None:
            raise ValueError(f"Vulnerabilidad {vulnerability_id} no encontrada")

        asset_result = await self._db.execute(
            select(Asset).where(Asset.id == vuln.asset_id)
        )
        asset = asset_result.scalar_one()

        # Seleccionar prompt de sistema según modo
        system_prompt = _TECHNICAL_SYSTEM_PROMPT if mode == RemediationModeEnum.technical else _EXPLAIN_SYSTEM_PROMPT

        # Llamar al LLM local
        prompt = self._build_prompt(vuln, asset, mode)
        llm_response = await self._ollama.generate(
            prompt=prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=0.2,
        )

        raw_text: str = llm_response.get("response", "{}")

        # Validar que sea JSON válido
        try:
            json.loads(raw_text)
        except json.JSONDecodeError:
            # Intentar extraer el JSON del texto si el modelo agregó texto extra
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            if start >= 0 and end > start:
                raw_text = raw_text[start:end]
            else:
                raw_text = json.dumps({"error": "Respuesta no estructurada", "raw": raw_text[:500]})

        suggestion = AIRemediationSuggestion(
            vulnerability_id=vulnerability_id,
            model_used=llm_response.get("model", model or "unknown"),
            prompt_tokens=llm_response.get("prompt_eval_count", 0),
            response_tokens=llm_response.get("eval_count", 0),
            suggestion_json=raw_text,
            mode=mode,
        )
        self._db.add(suggestion)
        await self._db.flush()

        return suggestion
