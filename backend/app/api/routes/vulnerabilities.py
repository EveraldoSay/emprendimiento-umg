"""Rutas para gestión de vulnerabilidades y remediación con IA."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, require_feature
from app.db.session import get_db
from app.models.ai_suggestion import AIRemediationSuggestion, RemediationModeEnum
from app.models.asset import Asset
from app.models.feature_flag import FeatureName
from app.models.vulnerability import Vulnerability, VulnStatusEnum, SeverityEnum

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerabilidades"])


class VulnStatusUpdate(BaseModel):
    status: VulnStatusEnum
    note: Optional[str] = None


class RemediationRequest(BaseModel):
    mode: RemediationModeEnum = RemediationModeEnum.technical
    model: Optional[str] = None


def _serialize_vuln(v: Vulnerability, asset_name: str = "") -> dict:
    return {
        "id": str(v.id),
        "asset_id": str(v.asset_id),
        "asset_name": asset_name,
        "cve_id": v.cve_id,
        "title": v.title,
        "description": v.description,
        "severity": v.severity.value,
        "cvss_score": v.cvss_score,
        "cvss_vector": v.cvss_vector,
        "affected_component": v.affected_component,
        "status": v.status.value,
        "discovered_at": v.discovered_at.isoformat(),
        "resolved_at": v.resolved_at.isoformat() if v.resolved_at else None,
    }


@router.get("/")
async def list_vulnerabilities(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    severity: Optional[SeverityEnum] = Query(None),
    vuln_status: Optional[VulnStatusEnum] = Query(None, alias="status"),
    asset_id: Optional[uuid.UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """Lista vulnerabilidades del tenant con filtros opcionales."""
    # Subquery para IDs de activos del tenant
    asset_subquery = select(Asset.id).where(
        Asset.organization_id == current_user.organization_id
    )

    query = (
        select(Vulnerability, Asset.name.label("asset_name"))
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .where(Vulnerability.asset_id.in_(asset_subquery))
    )

    if severity:
        query = query.where(Vulnerability.severity == severity)
    if vuln_status:
        query = query.where(Vulnerability.status == vuln_status)
    if asset_id:
        query = query.where(Vulnerability.asset_id == asset_id)

    query = query.order_by(Vulnerability.discovered_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)

    items = []
    for vuln, asset_name in result.all():
        items.append(_serialize_vuln(vuln, asset_name or ""))

    return {"total": len(items), "items": items}


@router.get("/{vuln_id}")
async def get_vulnerability(
    vuln_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Retorna el detalle de una vulnerabilidad."""
    result = await db.execute(
        select(Vulnerability, Asset.name.label("asset_name"))
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .where(
            Vulnerability.id == vuln_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerabilidad no encontrada")

    vuln, asset_name = row
    return _serialize_vuln(vuln, asset_name or "")


@router.patch("/{vuln_id}/status")
async def update_vuln_status(
    vuln_id: uuid.UUID,
    body: VulnStatusUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza el estado del ciclo de vida de una vulnerabilidad."""
    from datetime import datetime, timezone

    result = await db.execute(
        select(Vulnerability, Asset)
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .where(
            Vulnerability.id == vuln_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerabilidad no encontrada")

    vuln, _ = row
    vuln.status = body.status
    if body.status == VulnStatusEnum.resolved:
        vuln.resolved_at = datetime.now(timezone.utc)

    await db.flush()
    return {"id": str(vuln_id), "status": vuln.status.value}


@router.post(
    "/{vuln_id}/remediate",
    dependencies=[require_feature(FeatureName.ai_remediation)],
)
async def request_ai_remediation(
    vuln_id: uuid.UUID,
    body: RemediationRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """
    Solicita una sugerencia de remediación al LLM local (Ollama).
    Requiere feature flag: ai_remediation.
    """
    # Verificar que la vuln pertenece al tenant
    result = await db.execute(
        select(Vulnerability, Asset)
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .where(
            Vulnerability.id == vuln_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    if result.first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerabilidad no encontrada")

    from app.services.ai.remediation_service import RemediationService
    svc = RemediationService(db)
    suggestion = await svc.generate_suggestion(
        vulnerability_id=vuln_id,
        mode=body.mode,
        model=body.model,
    )

    import json
    return {
        "id": str(suggestion.id),
        "vulnerability_id": str(vuln_id),
        "model_used": suggestion.model_used,
        "mode": suggestion.mode.value,
        "suggestion": json.loads(suggestion.suggestion_json),
        "created_at": suggestion.created_at.isoformat(),
    }


@router.get(
    "/{vuln_id}/suggestions",
    dependencies=[require_feature(FeatureName.ai_remediation)],
)
async def get_ai_suggestions(
    vuln_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Historial de sugerencias IA para una vulnerabilidad. Requiere ai_remediation."""
    import json

    # Verificar pertenencia al tenant
    result = await db.execute(
        select(Vulnerability, Asset)
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .where(
            Vulnerability.id == vuln_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    if result.first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerabilidad no encontrada")

    suggestions_result = await db.execute(
        select(AIRemediationSuggestion)
        .where(AIRemediationSuggestion.vulnerability_id == vuln_id)
        .order_by(AIRemediationSuggestion.created_at.desc())
    )
    suggestions = suggestions_result.scalars().all()

    return {
        "vulnerability_id": str(vuln_id),
        "total": len(suggestions),
        "items": [
            {
                "id": str(s.id),
                "model_used": s.model_used,
                "mode": s.mode.value,
                "suggestion": json.loads(s.suggestion_json),
                "created_at": s.created_at.isoformat(),
            }
            for s in suggestions
        ],
    }
