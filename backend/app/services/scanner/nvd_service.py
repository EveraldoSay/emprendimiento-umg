"""Servicio de consulta a la base NVD para detección de CVEs."""

import asyncio
from typing import Any

import httpx

from app.core.config import settings


class NVDService:
    """
    Cliente para la API pública de NVD (National Vulnerability Database).
    Documentación: https://nvd.nist.gov/developers/vulnerabilities
    """

    def __init__(self) -> None:
        self._base_url = settings.NVD_BASE_URL
        self._api_key = settings.NVD_API_KEY

    def _headers(self) -> dict[str, str]:
        headers: dict[str, str] = {"Accept": "application/json"}
        if self._api_key:
            headers["apiKey"] = self._api_key
        return headers

    async def search_by_cpe(self, cpe_uri: str, limit: int = 20) -> list[dict[str, Any]]:
        """
        Busca CVEs que afecten a un CPE específico.

        Args:
            cpe_uri: URI CPE 2.3 (ej. 'cpe:2.3:a:apache:http_server:2.4.50:*:*:*:*:*:*:*')
            limit: Máximo de resultados.

        Returns:
            Lista de CVEs con id, description, cvss score y severity.
        """
        params = {
            "cpeName": cpe_uri,
            "resultsPerPage": limit,
            "startIndex": 0,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self._base_url,
                headers=self._headers(),
                params=params,
            )
            response.raise_for_status()
            data = response.json()
        return self._parse_cves(data)

    async def get_cve_details(self, cve_id: str) -> dict[str, Any] | None:
        """
        Obtiene detalles completos de un CVE específico.

        Args:
            cve_id: Identificador CVE (ej. 'CVE-2021-44228')
        """
        params = {"cveId": cve_id}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self._base_url,
                headers=self._headers(),
                params=params,
            )
            response.raise_for_status()
            data = response.json()

        vulns = data.get("vulnerabilities", [])
        if not vulns:
            return None
        return self._parse_single_cve(vulns[0])

    async def search_by_keyword(self, keyword: str, limit: int = 10) -> list[dict[str, Any]]:
        """Busca CVEs por palabra clave (nombre de software o tecnología)."""
        params = {"keywordSearch": keyword, "resultsPerPage": limit}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self._base_url,
                headers=self._headers(),
                params=params,
            )
            response.raise_for_status()
            data = response.json()
        return self._parse_cves(data)

    def _parse_cves(self, data: dict[str, Any]) -> list[dict[str, Any]]:
        """Extrae la información relevante de la respuesta NVD."""
        results = []
        for item in data.get("vulnerabilities", []):
            results.append(self._parse_single_cve(item))
        return results

    def _parse_single_cve(self, item: dict[str, Any]) -> dict[str, Any]:
        """Parsea un ítem CVE de la respuesta NVD."""
        cve = item.get("cve", {})
        cve_id = cve.get("id", "")

        # Descripción en inglés
        descriptions = cve.get("descriptions", [])
        description = next(
            (d["value"] for d in descriptions if d.get("lang") == "en"),
            "Sin descripción disponible",
        )

        # Score CVSS (prefiere v3.1, fallback a v2)
        cvss_score: float | None = None
        severity = "unknown"
        metrics = cve.get("metrics", {})
        if "cvssMetricV31" in metrics and metrics["cvssMetricV31"]:
            cvss_data = metrics["cvssMetricV31"][0].get("cvssData", {})
            cvss_score = cvss_data.get("baseScore")
            severity = cvss_data.get("baseSeverity", "unknown").lower()
        elif "cvssMetricV30" in metrics and metrics["cvssMetricV30"]:
            cvss_data = metrics["cvssMetricV30"][0].get("cvssData", {})
            cvss_score = cvss_data.get("baseScore")
            severity = cvss_data.get("baseSeverity", "unknown").lower()
        elif "cvssMetricV2" in metrics and metrics["cvssMetricV2"]:
            cvss_data = metrics["cvssMetricV2"][0].get("cvssData", {})
            cvss_score = cvss_data.get("baseScore")
            severity = "medium" if cvss_score and cvss_score >= 5 else "low"

        return {
            "cve_id": cve_id,
            "description": description,
            "cvss_score": cvss_score,
            "severity": severity,
            "published": cve.get("published", ""),
            "last_modified": cve.get("lastModified", ""),
        }
