"""
Script de seed de datos demo para desarrollo y presentaciones.
Crea organizaciones de demo (hospital y gobierno) con usuarios, activos y vulnerabilidades ficticias.

Uso:
    python -m scripts.seed_demo
"""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.organization import Organization, SectorEnum, PlanEnum
from app.models.user import User, RoleEnum
from app.models.asset import Asset, AssetTypeEnum, CriticalityEnum
from app.models.vulnerability import Vulnerability, SeverityEnum, VulnStatusEnum
from app.models.feature_flag import FeatureFlag, FeatureName
from app.services.feature_flag_service import FeatureFlagService


async def seed_organization(
    db: AsyncSession,
    name: str,
    sector: SectorEnum,
    plan: PlanEnum,
) -> Organization:
    """Crea una organización de demo."""
    org = Organization(name=name, sector=sector, plan=plan)
    db.add(org)
    await db.flush()
    return org


async def seed_user(
    db: AsyncSession,
    org: Organization,
    email: str,
    full_name: str,
    role: RoleEnum,
    password: str = "Demo1234!",
) -> User:
    user = User(
        organization_id=org.id,
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        role=role,
    )
    db.add(user)
    await db.flush()
    return user


async def seed_assets_and_vulns(db: AsyncSession, org: Organization) -> None:
    """Crea activos ficticios con vulnerabilidades conocidas."""
    assets_data = [
        ("Web Server Apache 2.4.50", AssetTypeEnum.server, "10.0.1.10", "Linux Ubuntu 22.04", CriticalityEnum.alta),
        ("Base de Datos PostgreSQL 14", AssetTypeEnum.server, "10.0.1.20", "Linux Debian 11", CriticalityEnum.alta),
        ("Servidor de Aplicaciones Node.js", AssetTypeEnum.vm, "10.0.1.30", "Linux CentOS 8", CriticalityEnum.media),
        ("Endpoint Administrativo Win11", AssetTypeEnum.endpoint, "10.0.2.10", "Windows 11 22H2", CriticalityEnum.media),
        ("Contenedor Docker Nginx", AssetTypeEnum.container, "10.0.3.1", "Alpine Linux 3.18", CriticalityEnum.baja),
    ]

    for name, atype, ip, os_str, criticality in assets_data:
        asset = Asset(
            organization_id=org.id,
            name=name,
            asset_type=atype,
            ip_address=ip,
            operating_system=os_str,
            criticality=criticality,
            last_scanned=datetime.now(timezone.utc) - timedelta(hours=6),
        )
        db.add(asset)
        await db.flush()

        # Vulnerabilidades ficticias basadas en CVEs reales
        vulns_data = [
            ("CVE-2021-44228", "Log4Shell — RCE en Log4j", SeverityEnum.critical, 10.0),
            ("CVE-2021-45046", "Log4Shell bypass (DoS/RCE)", SeverityEnum.critical, 9.0),
            ("CVE-2022-0778", "OpenSSL infinite loop DoS", SeverityEnum.high, 7.5),
        ] if criticality == CriticalityEnum.alta else [
            ("CVE-2023-44487", "HTTP/2 Rapid Reset Attack", SeverityEnum.high, 7.5),
        ]

        for cve_id, title, severity, cvss in vulns_data:
            vuln = Vulnerability(
                asset_id=asset.id,
                cve_id=cve_id,
                title=title,
                description=f"Vulnerabilidad ficticia para demo. CVE {cve_id} afecta a {name}.",
                severity=severity,
                cvss_score=cvss,
                status=VulnStatusEnum.open,
                discovered_at=datetime.now(timezone.utc) - timedelta(days=3),
            )
            db.add(vuln)


async def main() -> None:
    print("🌱 Iniciando seed de datos demo...")

    async with AsyncSessionLocal() as db:
        # --- Hospital ---
        hospital_org = await seed_organization(
            db, "Hospital Demo GT", SectorEnum.hospital, PlanEnum.premium
        )
        await seed_user(db, hospital_org, "admin@hospital.gt", "Dr. Admin Demo", RoleEnum.admin)
        await seed_user(db, hospital_org, "analyst@hospital.gt", "Analista TI Hospital", RoleEnum.analyst)
        await seed_assets_and_vulns(db, hospital_org)
        ff_svc = FeatureFlagService(db)
        await ff_svc.apply_plan_defaults(hospital_org.id, "premium")
        print(f"  ✅ Hospital: {hospital_org.id}")

        # --- Gobierno ---
        gov_org = await seed_organization(
            db, "Municipalidad Demo GT", SectorEnum.gobierno, PlanEnum.standard
        )
        await seed_user(db, gov_org, "admin@municipio.gt", "Admin Municipalidad", RoleEnum.admin)
        await seed_user(db, gov_org, "auditor@municipio.gt", "Auditor Municipalidad", RoleEnum.auditor)
        await seed_assets_and_vulns(db, gov_org)
        await ff_svc.apply_plan_defaults(gov_org.id, "standard")
        print(f"  ✅ Gobierno: {gov_org.id}")

        await db.commit()
        print("✅ Seed completado. Credenciales: admin@hospital.gt / Demo1234!")


if __name__ == "__main__":
    asyncio.run(main())
