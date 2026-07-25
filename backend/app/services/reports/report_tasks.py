"""Tareas Celery para generación asincrónica de reportes."""

import uuid

from app.core.celery_app import celery_app


@celery_app.task(
    name="app.services.reports.report_tasks.generate_report",
    bind=True,
    max_retries=2,
)
def generate_report(self, report_id: str) -> dict:
    """
    Genera el PDF del reporte en background y actualiza su estado en BD.

    Args:
        report_id: UUID del reporte a generar.
    """
    import asyncio
    from app.db.session import AsyncSessionLocal
    from app.models.report import Report, ReportStatusEnum
    from app.models.asset import Asset
    from app.models.vulnerability import Vulnerability
    from app.models.organization import Organization
    from app.services.reports.pdf_service import PDFReportService
    from sqlalchemy import select, func

    async def _run():
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Report).where(Report.id == uuid.UUID(report_id))
            )
            report = result.scalar_one_or_none()
            if report is None:
                return {"error": "Reporte no encontrado"}

            # Marcar como generando
            report.status = ReportStatusEnum.generating
            await db.flush()

            try:
                # Cargar organización
                org_result = await db.execute(
                    select(Organization).where(Organization.id == report.organization_id)
                )
                org = org_result.scalar_one()

                # Cargar activos
                assets_result = await db.execute(
                    select(Asset).where(
                        Asset.organization_id == report.organization_id,
                        Asset.is_active.is_(True),
                    )
                )
                assets = assets_result.scalars().all()
                assets_data = [
                    {
                        "name": a.name,
                        "asset_type": a.asset_type.value,
                        "ip_address": a.ip_address,
                        "criticality": a.criticality.value,
                        "operating_system": a.operating_system,
                    }
                    for a in assets
                ]
                asset_ids = [a.id for a in assets]

                # Cargar vulnerabilidades
                vulns_data: list[dict] = []
                summary = {"total_assets": len(assets), "critical_count": 0,
                           "high_count": 0, "medium_count": 0,
                           "low_count": 0, "resolved_count": 0}

                if asset_ids:
                    vulns_result = await db.execute(
                        select(Vulnerability, Asset.name.label("asset_name"))
                        .join(Asset, Vulnerability.asset_id == Asset.id)
                        .where(Vulnerability.asset_id.in_(asset_ids))
                    )
                    for vuln, asset_name in vulns_result.all():
                        vulns_data.append({
                            "cve_id": vuln.cve_id,
                            "title": vuln.title,
                            "severity": vuln.severity.value,
                            "cvss_score": vuln.cvss_score,
                            "status": vuln.status.value,
                            "description": vuln.description,
                            "asset_name": asset_name,
                        })
                        if vuln.status.value == "resolved":
                            summary["resolved_count"] += 1
                        elif vuln.severity.value == "critical":
                            summary["critical_count"] += 1
                        elif vuln.severity.value == "high":
                            summary["high_count"] += 1
                        elif vuln.severity.value == "medium":
                            summary["medium_count"] += 1
                        elif vuln.severity.value == "low":
                            summary["low_count"] += 1

                # Generar PDF
                pdf_svc = PDFReportService()
                file_path = pdf_svc.generate(
                    report_id=uuid.UUID(report_id),
                    organization_name=org.name,
                    standard=report.standard,
                    vulnerabilities=vulns_data,
                    assets=assets_data,
                    summary=summary,
                )

                report.file_path = file_path
                report.status = ReportStatusEnum.ready
                await db.commit()

                return {"report_id": report_id, "status": "ready", "file_path": file_path}

            except Exception as exc:
                report.status = ReportStatusEnum.failed
                await db.commit()
                raise self.retry(exc=exc)

    return asyncio.get_event_loop().run_until_complete(_run())
