"""Tareas Celery para escaneos asincrónicos."""

import uuid
from datetime import datetime, timezone

from app.core.celery_app import celery_app


@celery_app.task(
    name="app.services.scanner.scan_tasks.execute_scan",
    bind=True,
    max_retries=2,
    default_retry_delay=60,
)
def execute_scan(self, scan_job_id: str, scan_type: str = "quick") -> dict:
    """
    Tarea Celery que ejecuta un escaneo Nmap y persiste vulnerabilidades.

    Args:
        scan_job_id: UUID del ScanJob a ejecutar.
        scan_type: 'quick' o 'full'.

    Returns:
        Resumen del escaneo con hosts descubiertos y vulnerabilidades.
    """
    import asyncio
    from app.db.session import AsyncSessionLocal
    from app.models.scan_job import ScanJob, ScanStatusEnum
    from app.models.asset import Asset, AssetTypeEnum, CriticalityEnum
    from app.models.vulnerability import Vulnerability, SeverityEnum, VulnStatusEnum
    from app.services.scanner.nmap_service import NmapService
    from app.services.scanner.nvd_service import NVDService
    from sqlalchemy import select

    async def _run():
        async with AsyncSessionLocal() as db:
            # Cargar el ScanJob
            result = await db.execute(
                select(ScanJob).where(ScanJob.id == uuid.UUID(scan_job_id))
            )
            job = result.scalar_one_or_none()
            if job is None:
                return {"error": "ScanJob no encontrado"}

            job.status = ScanStatusEnum.running
            job.started_at = datetime.now(timezone.utc)
            await db.flush()

            try:
                nmap_svc = NmapService()
                nvd_svc = NVDService()

                if scan_type == "full":
                    host_results = nmap_svc.full_scan(job.target)
                else:
                    host_results = nmap_svc.quick_scan(job.target)

                vuln_count = 0
                assets_found = 0

                for host_result in host_results:
                    if host_result.status != "up":
                        continue

                    # Crear o actualizar activo
                    asset_result = await db.execute(
                        select(Asset).where(
                            Asset.organization_id == job.organization_id,
                            Asset.ip_address == host_result.ip_address,
                        )
                    )
                    asset = asset_result.scalar_one_or_none()

                    if asset is None:
                        asset = Asset(
                            organization_id=job.organization_id,
                            name=host_result.hostname or host_result.ip_address,
                            asset_type=AssetTypeEnum.server,
                            ip_address=host_result.ip_address,
                            hostname=host_result.hostname,
                            operating_system=host_result.os_guess,
                            criticality=CriticalityEnum.media,
                        )
                        db.add(asset)
                        await db.flush()
                        assets_found += 1
                    else:
                        asset.last_scanned = datetime.now(timezone.utc)
                        asset.operating_system = host_result.os_guess or asset.operating_system

                    # Buscar CVEs por CPE detectados
                    for cpe in host_result.raw_cpes:
                        if not cpe:
                            continue
                        cves = await nvd_svc.search_by_cpe(cpe, limit=10)
                        for cve_data in cves:
                            # Evitar duplicados
                            existing = await db.execute(
                                select(Vulnerability).where(
                                    Vulnerability.asset_id == asset.id,
                                    Vulnerability.cve_id == cve_data["cve_id"],
                                )
                            )
                            if existing.scalar_one_or_none():
                                continue

                            severity_map = {
                                "critical": SeverityEnum.critical,
                                "high": SeverityEnum.high,
                                "medium": SeverityEnum.medium,
                                "low": SeverityEnum.low,
                            }
                            severity = severity_map.get(
                                cve_data.get("severity", "").lower(), SeverityEnum.info
                            )

                            vuln = Vulnerability(
                                asset_id=asset.id,
                                cve_id=cve_data["cve_id"],
                                title=cve_data["cve_id"],
                                description=cve_data["description"],
                                severity=severity,
                                cvss_score=cve_data.get("cvss_score"),
                                status=VulnStatusEnum.open,
                                discovered_at=datetime.now(timezone.utc),
                            )
                            db.add(vuln)
                            vuln_count += 1

                job.status = ScanStatusEnum.completed
                job.completed_at = datetime.now(timezone.utc)
                await db.commit()

                return {
                    "scan_job_id": scan_job_id,
                    "status": "completed",
                    "assets_found": assets_found,
                    "vulnerabilities_found": vuln_count,
                }

            except Exception as exc:
                job.status = ScanStatusEnum.failed
                job.error_message = str(exc)[:1000]
                await db.commit()
                raise self.retry(exc=exc)

    return asyncio.get_event_loop().run_until_complete(_run())


@celery_app.task(name="app.services.scanner.scan_tasks.run_scheduled_scans")
def run_scheduled_scans() -> dict:
    """Ejecuta los escaneos programados para todas las organizaciones activas."""
    import asyncio
    from app.db.session import AsyncSessionLocal
    from app.models.organization import Organization
    from app.models.scan_job import ScanJob, ScanStatusEnum, ScanTypeEnum
    from app.models.asset import Asset
    from sqlalchemy import select

    async def _run():
        async with AsyncSessionLocal() as db:
            orgs = await db.execute(select(Organization).where(Organization.is_active.is_(True)))
            count = 0
            for org in orgs.scalars():
                assets = await db.execute(
                    select(Asset).where(
                        Asset.organization_id == org.id,
                        Asset.is_active.is_(True),
                        Asset.ip_address.isnot(None),
                    )
                )
                for asset in assets.scalars():
                    job = ScanJob(
                        organization_id=org.id,
                        asset_id=asset.id,
                        target=asset.ip_address,
                        scan_type=ScanTypeEnum.scheduled,
                        status=ScanStatusEnum.pending,
                    )
                    db.add(job)
                    await db.flush()
                    task = execute_scan.delay(str(job.id), "quick")
                    job.celery_task_id = task.id
                    count += 1
            await db.commit()
            return {"scheduled_scans": count}

    return asyncio.get_event_loop().run_until_complete(_run())
