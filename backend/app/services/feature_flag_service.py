"""Servicio de Feature Flags con caché Redis."""

import json
import uuid
from typing import Optional

import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.feature_flag import FeatureFlag, FeatureName

_CACHE_TTL = settings.REDIS_CACHE_TTL
_CACHE_PREFIX = "ff:"


class FeatureFlagService:
    """Lee y cachea feature flags por organización."""

    def __init__(self, db: AsyncSession, redis: Optional[aioredis.Redis] = None) -> None:
        self._db = db
        self._redis = redis

    def _cache_key(self, organization_id: uuid.UUID) -> str:
        return f"{_CACHE_PREFIX}{organization_id}"

    async def _get_flags_from_db(self, organization_id: uuid.UUID) -> dict[str, bool]:
        """Consulta los flags desde PostgreSQL."""
        result = await self._db.execute(
            select(FeatureFlag).where(FeatureFlag.organization_id == organization_id)
        )
        flags = result.scalars().all()
        return {flag.feature.value: flag.enabled for flag in flags}

    async def get_all(self, organization_id: uuid.UUID) -> dict[str, bool]:
        """Retorna todos los feature flags del tenant (con caché Redis si disponible)."""
        if self._redis:
            cached = await self._redis.get(self._cache_key(organization_id))
            if cached:
                return json.loads(cached)

        flags = await self._get_flags_from_db(organization_id)

        if self._redis:
            await self._redis.setex(
                self._cache_key(organization_id),
                _CACHE_TTL,
                json.dumps(flags),
            )

        return flags

    async def is_enabled(self, organization_id: uuid.UUID, feature: FeatureName) -> bool:
        """Verifica si un feature específico está activo para el tenant."""
        flags = await self.get_all(organization_id)
        return flags.get(feature.value, False)

    async def set_flag(
        self,
        organization_id: uuid.UUID,
        feature: FeatureName,
        enabled: bool,
        updated_by: Optional[uuid.UUID] = None,
    ) -> FeatureFlag:
        """Crea o actualiza un feature flag y limpia el caché."""
        result = await self._db.execute(
            select(FeatureFlag).where(
                FeatureFlag.organization_id == organization_id,
                FeatureFlag.feature == feature,
            )
        )
        flag = result.scalar_one_or_none()

        if flag is None:
            flag = FeatureFlag(
                organization_id=organization_id,
                feature=feature,
                enabled=enabled,
                updated_by=updated_by,
            )
            self._db.add(flag)
        else:
            flag.enabled = enabled
            flag.updated_by = updated_by

        await self._db.flush()

        # Invalidar caché
        if self._redis:
            await self._redis.delete(self._cache_key(organization_id))

        return flag

    async def apply_plan_defaults(
        self, organization_id: uuid.UUID, plan: str, updated_by: Optional[uuid.UUID] = None
    ) -> None:
        """Aplica la configuración de flags por defecto según el plan contratado."""
        plan_matrix: dict[str, dict[str, bool]] = {
            "standard": {
                FeatureName.ai_remediation.value: False,
                FeatureName.xdr.value: False,
                FeatureName.auto_remediation.value: False,
                FeatureName.dedicated_infra.value: False,
                FeatureName.advanced_compliance.value: False,
            },
            "premium": {
                FeatureName.ai_remediation.value: True,
                FeatureName.xdr.value: True,
                FeatureName.auto_remediation.value: True,
                FeatureName.dedicated_infra.value: False,
                FeatureName.advanced_compliance.value: False,
            },
            "enterprise": {
                FeatureName.ai_remediation.value: True,
                FeatureName.xdr.value: True,
                FeatureName.auto_remediation.value: True,
                FeatureName.dedicated_infra.value: True,
                FeatureName.advanced_compliance.value: True,
            },
        }
        defaults = plan_matrix.get(plan, plan_matrix["standard"])
        for feature_name, enabled in defaults.items():
            await self.set_flag(
                organization_id=organization_id,
                feature=FeatureName(feature_name),
                enabled=enabled,
                updated_by=updated_by,
            )
