"""Rutas de administración: organizaciones, feature flags, audit logs."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.feature_flag import FeatureName, FeatureFlag
from app.models.organization import Organization, PlanEnum
from app.models.user import RoleEnum
from app.services.feature_flag_service import FeatureFlagService

router = APIRouter(prefix="/admin", tags=["Administración"])


class PlanUpdate(BaseModel):
    plan: PlanEnum


class FeatureFlagUpdate(BaseModel):
    feature: FeatureName
    enabled: bool


def _is_superadmin(user) -> bool:
    return user.role == RoleEnum.superadmin


# --- Organizaciones ---

@router.get("/organizations")
async def list_organizations(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """Lista todas las organizaciones (tenants). Solo SuperAdmin."""
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo superadmin")

    result = await db.execute(
        select(Organization).offset(skip).limit(limit)
    )
    orgs = result.scalars().all()

    return {
        "total": len(orgs),
        "items": [
            {
                "id": str(o.id),
                "name": o.name,
                "sector": o.sector.value,
                "plan": o.plan.value,
                "is_active": o.is_active,
                "created_at": o.created_at.isoformat(),
            }
            for o in orgs
        ],
    }


@router.patch("/organizations/{org_id}/plan")
async def update_plan(
    org_id: uuid.UUID,
    body: PlanUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza el plan de una organización y ajusta feature flags. Solo SuperAdmin."""
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo superadmin")

    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organización no encontrada")

    org.plan = body.plan

    # Aplicar defaults de feature flags del nuevo plan
    ff_svc = FeatureFlagService(db)
    await ff_svc.apply_plan_defaults(
        organization_id=org_id,
        plan=body.plan.value,
        updated_by=current_user.id,
    )
    await db.flush()

    return {"message": f"Plan actualizado a {body.plan.value}", "org_id": str(org_id)}


# --- Feature Flags ---

@router.get("/feature-flags/{org_id}")
async def get_feature_flags(
    org_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Lista todos los feature flags de una organización."""
    # Admin puede ver flags de su propia org; superadmin puede ver cualquiera
    if not _is_superadmin(current_user) and current_user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    ff_svc = FeatureFlagService(db)
    flags = await ff_svc.get_all(org_id)
    return {"organization_id": str(org_id), "flags": flags}


@router.patch("/feature-flags/{org_id}")
async def update_feature_flag(
    org_id: uuid.UUID,
    body: FeatureFlagUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Activa o desactiva un feature flag específico. Solo SuperAdmin."""
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo superadmin")

    ff_svc = FeatureFlagService(db)
    flag = await ff_svc.set_flag(
        organization_id=org_id,
        feature=body.feature,
        enabled=body.enabled,
        updated_by=current_user.id,
    )
    return {
        "feature": flag.feature.value,
        "enabled": flag.enabled,
        "org_id": str(org_id),
    }


# --- Audit Logs ---

@router.get("/audit-logs")
async def list_audit_logs(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Lista logs de auditoría del tenant. Admin y Auditor."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.auditor, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    query = select(AuditLog).where(
        AuditLog.organization_id == current_user.organization_id
    )
    if action:
        query = query.where(AuditLog.action == action.upper())
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)

    query = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    logs = result.scalars().all()

    return {
        "total": len(logs),
        "items": [
            {
                "id": str(log.id),
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "user_id": str(log.user_id) if log.user_id else None,
                "ip_address": log.ip_address,
                "details": log.details,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
    }
