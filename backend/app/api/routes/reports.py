"""Rutas para generación y gestión de reportes de cumplimiento."""

import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser
from app.db.session import get_db
from app.models.report import Report, ReportFormatEnum, ReportStandardEnum, ReportStatusEnum
from app.models.user import RoleEnum

router = APIRouter(prefix="/reports", tags=["Reportes"])


class ReportCreate(BaseModel):
    title: str
    standard: ReportStandardEnum
    format: ReportFormatEnum = ReportFormatEnum.pdf


def _serialize_report(r: Report) -> dict:
    return {
        "id": str(r.id),
        "title": r.title,
        "standard": r.standard.value,
        "format": r.format.value,
        "status": r.status.value,
        "signed": r.signed,
        "file_path": r.file_path,
        "created_at": r.created_at.isoformat(),
    }


@router.post("/", status_code=status.HTTP_202_ACCEPTED)
async def create_report(
    body: ReportCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Inicia la generación asincrónica de un reporte."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.auditor, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    report = Report(
        organization_id=current_user.organization_id,
        title=body.title,
        standard=body.standard,
        format=body.format,
        generated_by=current_user.id,
        status=ReportStatusEnum.pending,
    )
    db.add(report)
    await db.flush()

    # Despachar a Celery
    from app.services.reports.report_tasks import generate_report
    task = generate_report.delay(str(report.id))
    report.celery_task_id = task.id
    await db.flush()

    return {
        "message": "Generación de reporte iniciada",
        "report": _serialize_report(report),
    }


@router.get("/")
async def list_reports(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    report_status: Optional[ReportStatusEnum] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Lista los reportes del tenant."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.auditor, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    query = select(Report).where(Report.organization_id == current_user.organization_id)
    if report_status:
        query = query.where(Report.status == report_status)

    query = query.order_by(Report.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    reports = result.scalars().all()

    return {"total": len(reports), "items": [_serialize_report(r) for r in reports]}


@router.get("/{report_id}/download")
async def download_report(
    report_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Descarga el archivo de un reporte listo."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.auditor, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.organization_id == current_user.organization_id,
        )
    )
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado")

    if report.status != ReportStatusEnum.ready:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El reporte aún no está listo. Estado actual: {report.status.value}",
        )

    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado")

    media_type = "application/pdf" if report.format == ReportFormatEnum.pdf else "text/csv"
    filename = os.path.basename(report.file_path)

    return FileResponse(
        path=report.file_path,
        media_type=media_type,
        filename=filename,
    )


@router.post("/{report_id}/sign")
async def sign_report(
    report_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Marca un reporte como firmado digitalmente. Solo Admin."""
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores pueden firmar reportes")

    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.organization_id == current_user.organization_id,
        )
    )
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado")

    if report.status != ReportStatusEnum.ready:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El reporte no está listo para firmar")

    report.signed = True
    await db.flush()

    return {"message": "Reporte firmado digitalmente", "report_id": str(report_id)}
