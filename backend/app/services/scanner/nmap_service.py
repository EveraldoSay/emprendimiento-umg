"""Servicio de escaneo Nmap agentless."""

import ipaddress
import re
from dataclasses import dataclass, field
from typing import Any

import nmap


@dataclass
class PortInfo:
    """Información de un puerto detectado."""
    port: int
    protocol: str
    state: str
    service: str
    version: str = ""
    product: str = ""


@dataclass
class HostScanResult:
    """Resultado del escaneo de un host individual."""
    ip_address: str
    hostname: str = ""
    status: str = "down"
    os_guess: str = ""
    ports: list[PortInfo] = field(default_factory=list)
    mac_address: str = ""
    raw_cpes: list[str] = field(default_factory=list)


class NmapService:
    """
    Ejecuta escaneos Nmap de forma agentless.
    Requiere que nmap esté instalado en el sistema (o contenedor Docker).
    """

    def __init__(self, nmap_path: str | None = None) -> None:
        kwargs: dict[str, Any] = {}
        if nmap_path:
            kwargs["nmap_search_path"] = (nmap_path,)
        self._nm = nmap.PortScanner(**kwargs)

    @staticmethod
    def _is_valid_target(target: str) -> bool:
        """Valida que el target sea una IP, hostname o CIDR válido."""
        try:
            ipaddress.ip_network(target, strict=False)
            return True
        except ValueError:
            pass
        # Hostname básico
        hostname_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})*$'
        return bool(re.match(hostname_pattern, target))

    def quick_scan(self, target: str) -> list[HostScanResult]:
        """
        Escaneo rápido: hosts activos y puertos comunes (top 100).
        Equivalente a: nmap -T4 -F --open
        """
        if not self._is_valid_target(target):
            raise ValueError(f"Target inválido: {target!r}")

        self._nm.scan(hosts=target, arguments="-T4 -F --open -sV --version-intensity 3")
        return self._parse_results()

    def full_scan(self, target: str) -> list[HostScanResult]:
        """
        Escaneo completo: todos los puertos, detección de OS y versión de servicios.
        Equivalente a: nmap -T4 -p- -sV -O
        """
        if not self._is_valid_target(target):
            raise ValueError(f"Target inválido: {target!r}")

        self._nm.scan(
            hosts=target,
            arguments="-T4 -p- -sV -O --version-intensity 5 --open",
        )
        return self._parse_results()

    def _parse_results(self) -> list[HostScanResult]:
        """Convierte el output de nmap en objetos HostScanResult."""
        results: list[HostScanResult] = []

        for host in self._nm.all_hosts():
            host_info = self._nm[host]
            status = host_info.state()
            hostname = ""
            if host_info.hostname():
                hostname = host_info.hostname()

            # OS
            os_guess = ""
            if "osmatch" in host_info and host_info["osmatch"]:
                os_guess = host_info["osmatch"][0].get("name", "")

            # MAC
            mac = ""
            if "addresses" in host_info and "mac" in host_info["addresses"]:
                mac = host_info["addresses"]["mac"]

            # Puertos
            ports: list[PortInfo] = []
            cpes: list[str] = []
            for proto in host_info.all_protocols():
                for port_num in host_info[proto].keys():
                    port_data = host_info[proto][port_num]
                    ports.append(PortInfo(
                        port=port_num,
                        protocol=proto,
                        state=port_data.get("state", ""),
                        service=port_data.get("name", ""),
                        version=port_data.get("version", ""),
                        product=port_data.get("product", ""),
                    ))
                    if port_data.get("cpe"):
                        cpes.extend(port_data["cpe"].split(","))

            results.append(HostScanResult(
                ip_address=host,
                hostname=hostname,
                status=status,
                os_guess=os_guess,
                ports=ports,
                mac_address=mac,
                raw_cpes=cpes,
            ))

        return results
