"""Rutas para gestión de escaneos de vulnerabilidades."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser
from app.db.session import get_db
from app.models.scan_job import ScanJob, ScanStatusEnum, ScanTypeEnum
from app.models.user import RoleEnum

router = APIRouter(prefix="/scans", tags=["Escaneos"])


class ScanCreate(BaseModel):
    target: str
    scan_type: ScanTypeEnum = ScanTypeEnum.quick
    asset_id: Optional[uuid.UUID] = None


def _serialize_job(job: ScanJob) -> dict:
    return {
        "id": str(job.id),
        "target": job.target,
        "scan_type": job.scan_type.value,
        "status": job.status.value,
        "celery_task_id": job.celery_task_id,
        "asset_id": str(job.asset_id) if job.asset_id else None,
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "error_message": job.error_message,
        "created_at": job.created_at.isoformat(),
    }


@router.post("/", status_code=status.HTTP_202_ACCEPTED)
async def create_scan(
    body: ScanCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """
    Inicia un escaneo asincrónico.
    Retorna el job_id para hacer polling del estado.
    """
    if current_user.role not in (RoleEnum.admin, RoleEnum.analyst, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    job = ScanJob(
        organization_id=current_user.organization_id,
        created_by=current_user.id,
        target=body.target,
        scan_type=body.scan_type,
        asset_id=body.asset_id,
        status=ScanStatusEnum.pending,
    )
    db.add(job)
    await db.flush()

    # Despachar tarea Celery
    from app.services.scanner.scan_tasks import execute_scan
    task = execute_scan.delay(str(job.id), body.scan_type.value)
    job.celery_task_id = task.id
    await db.flush()

    return {
        "message": "Escaneo iniciado en cola",
        "scan_job": _serialize_job(job),
    }


@router.get("/")
async def list_scans(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[ScanStatusEnum] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Lista el historial de escaneos del tenant."""
    query = select(ScanJob).where(
        ScanJob.organization_id == current_user.organization_id
    )
    if status_filter:
        query = query.where(ScanJob.status == status_filter)

    query = query.order_by(ScanJob.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    jobs = result.scalars().all()

    return {"total": len(jobs), "items": [_serialize_job(j) for j in jobs]}


@router.get("/{scan_id}")
async def get_scan(
    scan_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Retorna el estado actual de un escaneo."""
    result = await db.execute(
        select(ScanJob).where(
            ScanJob.id == scan_id,
            ScanJob.organization_id == current_user.organization_id,
        )
    )
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Escaneo no encontrado")
    return _serialize_job(job)


@router.post("/{scan_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_scan(
    scan_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Cancela un escaneo en cola o en ejecución. Solo Admin."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    result = await db.execute(
        select(ScanJob).where(
            ScanJob.id == scan_id,
            ScanJob.organization_id == current_user.organization_id,
        )
    )
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Escaneo no encontrado")

    if job.status not in (ScanStatusEnum.pending, ScanStatusEnum.running):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar un escaneo en estado: {job.status.value}",
        )

    # Revocar tarea Celery
    if job.celery_task_id:
        from app.core.celery_app import celery_app
        celery_app.control.revoke(job.celery_task_id, terminate=True)

    job.status = ScanStatusEnum.cancelled
    await db.flush()

    return {"message": "Escaneo cancelado", "scan_id": str(scan_id)}
