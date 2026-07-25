"""Generador de reportes PDF multi-estándar usando ReportLab."""

import io
import os
import uuid
from datetime import datetime, timezone
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.core.config import settings
from app.models.report import ReportStandardEnum


_STANDARD_LABELS = {
    ReportStandardEnum.iso27001: "ISO/IEC 27001:2022",
    ReportStandardEnum.nist: "NIST Cybersecurity Framework 2.0",
    ReportStandardEnum.cis: "CIS Controls v8",
    ReportStandardEnum.ley_gt: "Ley de Ciberseguridad de Guatemala",
}

_BRAND_COLOR = colors.HexColor("#1a56db")
_ACCENT_COLOR = colors.HexColor("#ef4444")
_LIGHT_GRAY = colors.HexColor("#f3f4f6")
_DARK_GRAY = colors.HexColor("#374151")


class PDFReportService:
    """Genera reportes PDF alineados con estándares de cumplimiento."""

    def __init__(self) -> None:
        os.makedirs(settings.REPORTS_DIR, exist_ok=True)
        self._styles = getSampleStyleSheet()
        self._title_style = ParagraphStyle(
            "CustomTitle",
            parent=self._styles["Title"],
            textColor=_BRAND_COLOR,
            fontSize=22,
            spaceAfter=12,
        )
        self._heading_style = ParagraphStyle(
            "CustomHeading",
            parent=self._styles["Heading2"],
            textColor=_BRAND_COLOR,
            fontSize=14,
            spaceBefore=12,
            spaceAfter=6,
        )
        self._body_style = ParagraphStyle(
            "CustomBody",
            parent=self._styles["Normal"],
            fontSize=10,
            textColor=_DARK_GRAY,
            spaceAfter=6,
        )

    def generate(
        self,
        report_id: uuid.UUID,
        organization_name: str,
        standard: ReportStandardEnum,
        vulnerabilities: list[dict[str, Any]],
        assets: list[dict[str, Any]],
        summary: dict[str, Any],
    ) -> str:
        """
        Genera el PDF y retorna la ruta del archivo creado.

        Args:
            report_id: UUID del reporte.
            organization_name: Nombre del cliente.
            standard: Estándar de cumplimiento.
            vulnerabilities: Lista de vulns serializadas.
            assets: Lista de activos serializados.
            summary: Métricas resumen (critical_count, high_count, etc.).

        Returns:
            Ruta absoluta del PDF generado.
        """
        filename = f"{settings.REPORTS_DIR}/{report_id}_{standard.value}.pdf"
        doc = SimpleDocTemplate(
            filename,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        story = []
        standard_label = _STANDARD_LABELS.get(standard, standard.value.upper())
        generated_at = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")

        # ---- Portada ----
        story.append(Paragraph("CyberSec AI Platform", self._title_style))
        story.append(Paragraph(f"Reporte de Cumplimiento — {standard_label}", self._heading_style))
        story.append(HRFlowable(width="100%", thickness=2, color=_BRAND_COLOR))
        story.append(Spacer(1, 0.5 * cm))
        story.append(Paragraph(f"<b>Organización:</b> {organization_name}", self._body_style))
        story.append(Paragraph(f"<b>Generado:</b> {generated_at}", self._body_style))
        story.append(Paragraph(f"<b>ID Reporte:</b> {report_id}", self._body_style))
        story.append(Spacer(1, 1 * cm))

        # ---- Resumen Ejecutivo ----
        story.append(Paragraph("1. Resumen Ejecutivo", self._heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=_LIGHT_GRAY))
        story.append(Spacer(1, 0.3 * cm))

        summary_data = [
            ["Métricas", "Valor"],
            ["Total de Activos", str(summary.get("total_assets", len(assets)))],
            ["Vulnerabilidades Críticas", str(summary.get("critical_count", 0))],
            ["Vulnerabilidades Altas", str(summary.get("high_count", 0))],
            ["Vulnerabilidades Medias", str(summary.get("medium_count", 0))],
            ["Vulnerabilidades Bajas", str(summary.get("low_count", 0))],
            ["Vulnerabilidades Resueltas", str(summary.get("resolved_count", 0))],
        ]
        summary_table = Table(summary_data, colWidths=[10 * cm, 6 * cm])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), _BRAND_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.8 * cm))

        # ---- Inventario de Activos ----
        if assets:
            story.append(Paragraph("2. Inventario de Activos", self._heading_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=_LIGHT_GRAY))
            story.append(Spacer(1, 0.3 * cm))
            asset_headers = [["Nombre", "Tipo", "IP", "Criticidad", "OS"]]
            asset_rows = [
                [
                    a.get("name", "")[:30],
                    a.get("asset_type", ""),
                    a.get("ip_address", "N/A"),
                    a.get("criticality", ""),
                    (a.get("operating_system") or "N/A")[:30],
                ]
                for a in assets[:50]  # Máximo 50 activos en el reporte
            ]
            asset_table = Table(
                asset_headers + asset_rows,
                colWidths=[5 * cm, 3 * cm, 3.5 * cm, 2.5 * cm, 3 * cm],
            )
            asset_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), _BRAND_COLOR),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _LIGHT_GRAY]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(asset_table)
            story.append(Spacer(1, 0.8 * cm))

        # ---- Vulnerabilidades Críticas y Altas ----
        high_vulns = [
            v for v in vulnerabilities
            if v.get("severity") in ("critical", "high")
        ]
        if high_vulns:
            story.append(Paragraph("3. Vulnerabilidades de Alta Prioridad", self._heading_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=_LIGHT_GRAY))
            for v in high_vulns[:30]:
                sev = v.get("severity", "").upper()
                sev_color = _ACCENT_COLOR if sev == "CRITICAL" else colors.orange
                story.append(Spacer(1, 0.3 * cm))
                story.append(Paragraph(
                    f'<font color="#{sev_color.hexval()[2:]}"><b>[{sev}]</b></font> '
                    f'{v.get("cve_id", "N/A")} — {v.get("title", "")}',
                    self._body_style,
                ))
                story.append(Paragraph(
                    f'CVSS: {v.get("cvss_score", "N/A")} | '
                    f'Estado: {v.get("status", "").upper()} | '
                    f'Activo: {v.get("asset_name", "N/A")}',
                    ParagraphStyle("small", parent=self._body_style, fontSize=9),
                ))
                if v.get("description"):
                    story.append(Paragraph(
                        v["description"][:400],
                        ParagraphStyle("desc", parent=self._body_style, fontSize=9, textColor=colors.grey),
                    ))

        # ---- Sección de cumplimiento por estándar ----
        story.append(Spacer(1, 0.8 * cm))
        story.append(Paragraph(f"4. Alineación con {standard_label}", self._heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=_LIGHT_GRAY))
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph(self._get_compliance_text(standard), self._body_style))

        # ---- Pie de página ----
        story.append(Spacer(1, 1 * cm))
        story.append(HRFlowable(width="100%", thickness=1, color=_BRAND_COLOR))
        story.append(Paragraph(
            "Este reporte es confidencial y fue generado automáticamente por CyberSec AI Platform. "
            "Los datos se procesaron íntegramente en la infraestructura local del cliente.",
            ParagraphStyle("footer", parent=self._body_style, fontSize=8, textColor=colors.grey),
        ))

        doc.build(story)
        return filename

    def _get_compliance_text(self, standard: ReportStandardEnum) -> str:
        """Retorna el texto descriptivo de cumplimiento según el estándar."""
        texts = {
            ReportStandardEnum.iso27001: (
                "Este reporte cubre los controles del Anexo A de ISO/IEC 27001:2022, "
                "incluyendo A.8 (Activos de información), A.9 (Control de acceso), "
                "A.12 (Seguridad de las operaciones) y A.16 (Gestión de incidentes de seguridad). "
                "Se recomienda revisar las vulnerabilidades críticas como parte del tratamiento de riesgos."
            ),
            ReportStandardEnum.nist: (
                "Alineado con el NIST Cybersecurity Framework 2.0. Las funciones evaluadas son: "
                "IDENTIFY (GV, ID), PROTECT (PR), DETECT (DE), RESPOND (RS) y RECOVER (RC). "
                "Se priorizan las acciones de detección y respuesta ante las vulnerabilidades reportadas."
            ),
            ReportStandardEnum.cis: (
                "Este reporte evalúa el cumplimiento de los CIS Controls v8, "
                "con énfasis en los Controles Básicos (IG1): "
                "Control 1 (Inventario de activos), Control 2 (Software autorizado), "
                "Control 3 (Protección de datos), Control 6 (Gestión de accesos) y "
                "Control 7 (Gestión continua de vulnerabilidades)."
            ),
            ReportStandardEnum.ley_gt: (
                "Conforme a la Ley de Ciberseguridad de Guatemala y las directrices del CERT-GT. "
                "Se incluyen los incidentes detectados que deben ser reportados según el artículo "
                "correspondiente a notificación de brechas de seguridad. Las organizaciones de "
                "infraestructura crítica deben notificar incidentes de severidad ALTA y CRÍTICA "
                "en un plazo no mayor a 72 horas."
            ),
        }
        return texts.get(standard, "Reporte generado bajo estándares internacionales de ciberseguridad.")
