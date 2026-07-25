"""Rutas para gestión de activos digitales."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser
from app.db.session import get_db
from app.models.asset import Asset, AssetTypeEnum, CriticalityEnum
from app.models.user import RoleEnum
from app.models.vulnerability import Vulnerability

router = APIRouter(prefix="/assets", tags=["Activos"])


# --- Schemas ---

class AssetCreate(BaseModel):
    name: str
    asset_type: AssetTypeEnum
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    operating_system: Optional[str] = None
    criticality: CriticalityEnum = CriticalityEnum.media
    sector_tag: Optional[str] = None
    description: Optional[str] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[AssetTypeEnum] = None
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    operating_system: Optional[str] = None
    criticality: Optional[CriticalityEnum] = None
    sector_tag: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


def _serialize_asset(asset: Asset) -> dict:
    return {
        "id": str(asset.id),
        "name": asset.name,
        "asset_type": asset.asset_type.value,
        "ip_address": asset.ip_address,
        "hostname": asset.hostname,
        "operating_system": asset.operating_system,
        "criticality": asset.criticality.value,
        "sector_tag": asset.sector_tag,
        "description": asset.description,
        "is_active": asset.is_active,
        "last_scanned": asset.last_scanned.isoformat() if asset.last_scanned else None,
        "created_at": asset.created_at.isoformat(),
    }


# --- Endpoints ---

@router.get("/")
async def list_assets(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    criticality: Optional[CriticalityEnum] = Query(None),
    asset_type: Optional[AssetTypeEnum] = Query(None),
    is_active: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """Lista los activos del tenant con filtros opcionales."""
    query = select(Asset).where(
        Asset.organization_id == current_user.organization_id,
        Asset.is_active == is_active,
    )
    if criticality:
        query = query.where(Asset.criticality == criticality)
    if asset_type:
        query = query.where(Asset.asset_type == asset_type)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    assets = result.scalars().all()

    return {
        "total": len(assets),
        "items": [_serialize_asset(a) for a in assets],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_asset(
    body: AssetCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Crea un activo manualmente. Requiere rol Admin o Analyst."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.analyst, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    asset = Asset(
        organization_id=current_user.organization_id,
        **body.model_dump(exclude_none=True),
    )
    db.add(asset)
    await db.flush()

    return _serialize_asset(asset)


@router.get("/{asset_id}")
async def get_asset(
    asset_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Retorna el detalle de un activo."""
    result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activo no encontrado")
    return _serialize_asset(asset)


@router.put("/{asset_id}")
async def update_asset(
    asset_id: uuid.UUID,
    body: AssetUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza los datos de un activo. Requiere Admin o Analyst."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.analyst, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activo no encontrado")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(asset, field, value)

    await db.flush()
    return _serialize_asset(asset)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Elimina (desactiva) un activo. Solo Admin."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activo no encontrado")

    asset.is_active = False
    await db.flush()


@router.get("/{asset_id}/vulnerabilities")
async def get_asset_vulnerabilities(
    asset_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """Lista las vulnerabilidades asociadas a un activo."""
    # Verificar que el activo pertenece al tenant
    asset_result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.organization_id == current_user.organization_id,
        )
    )
    if asset_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activo no encontrado")

    vuln_result = await db.execute(
        select(Vulnerability)
        .where(Vulnerability.asset_id == asset_id)
        .offset(skip)
        .limit(limit)
    )
    vulns = vuln_result.scalars().all()

    return {
        "asset_id": str(asset_id),
        "total": len(vulns),
        "items": [
            {
                "id": str(v.id),
                "cve_id": v.cve_id,
                "title": v.title,
                "severity": v.severity.value,
                "cvss_score": v.cvss_score,
                "status": v.status.value,
                "discovered_at": v.discovered_at.isoformat(),
            }
            for v in vulns
        ],
    }
