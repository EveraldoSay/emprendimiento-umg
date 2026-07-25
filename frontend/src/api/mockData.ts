/**
 * Datos mock para modo demo offline (GitHub Pages / sin backend).
 * Entidades reales: UMG (privada) y USAC (pública autónoma).
 */

import type { Asset, Vulnerability, ScanJob, Report, XDRAlert } from '@/types'

// ─── ACTIVOS ──────────────────────────────────────────────────────────────────

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'a1', name: 'Web Server UMG Portal Académico', asset_type: 'server',
    ip_address: '190.0.0.10', hostname: 'portal.umg.edu.gt',
    operating_system: 'Ubuntu Server 22.04 LTS', criticality: 'alta',
    sector_tag: 'educacion', description: 'Servidor principal del portal estudiantil',
    is_active: true, last_scanned: '2025-07-24T08:00:00Z', created_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'a2', name: 'Base de Datos Académica PostgreSQL', asset_type: 'server',
    ip_address: '190.0.0.20', hostname: 'db-academica.umg.edu.gt',
    operating_system: 'Debian 12', criticality: 'alta',
    sector_tag: 'educacion', description: 'BD con expedientes de 40,000 estudiantes',
    is_active: true, last_scanned: '2025-07-24T08:15:00Z', created_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'a3', name: 'Servidor de Correo Institucional', asset_type: 'server',
    ip_address: '190.0.0.30', hostname: 'mail.umg.edu.gt',
    operating_system: 'CentOS 8', criticality: 'alta',
    sector_tag: 'comunicaciones', description: 'Servicio de correo para 5,000 cuentas institucionales',
    is_active: true, last_scanned: '2025-07-23T20:00:00Z', created_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'a4', name: 'Sistema ERP Administrativo', asset_type: 'vm',
    ip_address: '192.168.10.50', hostname: 'erp.umg.edu.gt',
    operating_system: 'Windows Server 2019', criticality: 'alta',
    sector_tag: 'finanzas', description: 'Sistema de gestión financiera y RRHH',
    is_active: true, last_scanned: '2025-07-22T10:00:00Z', created_at: '2025-02-01T00:00:00Z',
  },
  {
    id: 'a5', name: 'Firewall Perimetral FortiGate', asset_type: 'network_device',
    ip_address: '190.0.0.1', hostname: 'fw-perimetral.umg.edu.gt',
    operating_system: 'FortiOS 7.4', criticality: 'alta',
    sector_tag: 'red', description: 'Firewall principal de borde de red',
    is_active: true, last_scanned: '2025-07-24T06:00:00Z', created_at: '2025-01-05T00:00:00Z',
  },
]

export const MOCK_ASSETS_USAC: Asset[] = [
  {
    id: 'b1', name: 'Portal SIIF USAC', asset_type: 'server',
    ip_address: '200.0.0.10', hostname: 'siif.usac.edu.gt',
    operating_system: 'Red Hat Enterprise 9', criticality: 'alta',
    sector_tag: 'gobierno', description: 'Sistema integrado de información financiera',
    is_active: true, last_scanned: '2025-07-24T07:00:00Z', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'b2', name: 'Servidor DNS Primario USAC', asset_type: 'server',
    ip_address: '200.0.0.5', hostname: 'dns1.usac.edu.gt',
    operating_system: 'Ubuntu 20.04 LTS', criticality: 'alta',
    sector_tag: 'infraestructura', description: 'DNS autoritativo de la red universitaria',
    is_active: true, last_scanned: '2025-07-23T22:00:00Z', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'b3', name: 'Sistema de Registro Estudiantil', asset_type: 'vm',
    ip_address: '192.168.20.100', hostname: 'registro.usac.edu.gt',
    operating_system: 'Windows Server 2022', criticality: 'alta',
    sector_tag: 'educacion', description: 'Registro de 200,000 estudiantes activos',
    is_active: true, last_scanned: '2025-07-22T18:00:00Z', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'b4', name: 'Servidor de Videoconferencia', asset_type: 'container',
    ip_address: '192.168.20.200', hostname: null,
    operating_system: 'Alpine Linux 3.19', criticality: 'media',
    sector_tag: 'comunicaciones', description: 'Plataforma de clases virtuales (Jitsi)',
    is_active: true, last_scanned: '2025-07-24T01:00:00Z', created_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'b5', name: 'Endpoint Rector — Workstation', asset_type: 'endpoint',
    ip_address: '192.168.1.50', hostname: null,
    operating_system: 'Windows 11 Pro 23H2', criticality: 'media',
    sector_tag: 'administrativo', description: 'Estación de trabajo — Oficina del Rector',
    is_active: true, last_scanned: '2025-07-20T14:00:00Z', created_at: '2025-02-15T00:00:00Z',
  },
]

// ─── VULNERABILIDADES ─────────────────────────────────────────────────────────

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'v1', asset_id: 'a1', asset_name: 'Web Server UMG Portal Académico',
    cve_id: 'CVE-2021-44228', title: 'Log4Shell — Ejecución Remota de Código en Log4j',
    description: 'Vulnerabilidad crítica en Apache Log4j 2 (≤2.14.1) que permite a un atacante remoto ejecutar código arbitrario mediante una cadena JNDI maliciosa en cualquier campo que Log4j registre.',
    severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    affected_component: 'Apache Log4j 2.14.1', status: 'open',
    discovered_at: '2025-07-24T08:05:00Z', resolved_at: null,
  },
  {
    id: 'v2', asset_id: 'a2', asset_name: 'Base de Datos Académica PostgreSQL',
    cve_id: 'CVE-2023-2454', title: 'PostgreSQL — Escalada de Privilegios via CREATE SCHEMA',
    description: 'Un usuario con privilegio CREATE puede inducir a funciones del sistema a ejecutar código arbitrario con los privilegios del superusuario de PostgreSQL.',
    severity: 'high', cvss_score: 7.2, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H',
    affected_component: 'PostgreSQL 15.2', status: 'in_remediation',
    discovered_at: '2025-07-23T10:00:00Z', resolved_at: null,
  },
  {
    id: 'v3', asset_id: 'a3', asset_name: 'Servidor de Correo Institucional',
    cve_id: 'CVE-2021-26855', title: 'ProxyLogon — RCE en Microsoft Exchange (SSRF)',
    description: 'Vulnerabilidad SSRF en Exchange Server que permite a un atacante no autenticado enviar solicitudes HTTP arbitrarias y autenticarse como servidor Exchange.',
    severity: 'critical', cvss_score: 9.8, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    affected_component: 'Microsoft Exchange Server 2019', status: 'open',
    discovered_at: '2025-07-22T16:00:00Z', resolved_at: null,
  },
  {
    id: 'v4', asset_id: 'a4', asset_name: 'Sistema ERP Administrativo',
    cve_id: 'CVE-2022-30190', title: 'Follina — Ejecución de Código via MSDT (Windows)',
    description: 'Vulnerabilidad en la Herramienta de Diagnóstico de Soporte de Microsoft que permite la ejecución remota de código al abrir un documento de Word malicioso.',
    severity: 'high', cvss_score: 7.8, cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H',
    affected_component: 'Windows Server 2019 — MSDT', status: 'open',
    discovered_at: '2025-07-21T09:00:00Z', resolved_at: null,
  },
  {
    id: 'v5', asset_id: 'a1', asset_name: 'Web Server UMG Portal Académico',
    cve_id: 'CVE-2023-44487', title: 'HTTP/2 Rapid Reset Attack (DDoS)',
    description: 'Vulnerabilidad en la implementación de HTTP/2 que permite a un atacante generar una cantidad masiva de streams y cancelarlos inmediatamente, causando denegación de servicio.',
    severity: 'high', cvss_score: 7.5, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    affected_component: 'Nginx 1.18.0', status: 'resolved',
    discovered_at: '2025-07-10T14:00:00Z', resolved_at: '2025-07-18T10:00:00Z',
  },
  {
    id: 'v6', asset_id: 'b1', asset_name: 'Portal SIIF USAC',
    cve_id: 'CVE-2022-0778', title: 'OpenSSL — Bucle Infinito en BN_mod_sqrt (DoS)',
    description: 'La función BN_mod_sqrt de OpenSSL puede ejecutarse en un bucle infinito al procesar certificados con parámetros de curva elíptica no válidos, causando denegación de servicio.',
    severity: 'high', cvss_score: 7.5, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    affected_component: 'OpenSSL 3.0.1', status: 'open',
    discovered_at: '2025-07-23T11:00:00Z', resolved_at: null,
  },
  {
    id: 'v7', asset_id: 'b2', asset_name: 'Servidor DNS Primario USAC',
    cve_id: 'CVE-2020-1350', title: 'SIGRed — RCE en Windows DNS Server',
    description: 'Vulnerabilidad en el servidor DNS de Windows que permite la ejecución remota de código sin autenticación mediante una respuesta DNS maliciosa.',
    severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    affected_component: 'BIND 9.11.3', status: 'open',
    discovered_at: '2025-07-22T08:00:00Z', resolved_at: null,
  },
  {
    id: 'v8', asset_id: 'b3', asset_name: 'Sistema de Registro Estudiantil',
    cve_id: 'CVE-2023-21554', title: 'QueueJumper — RCE en Microsoft Message Queuing',
    description: 'Vulnerabilidad crítica en el servicio MSMQ de Windows que permite ejecución remota de código sin autenticación a través del puerto 1801/TCP.',
    severity: 'critical', cvss_score: 9.8, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    affected_component: 'Windows Server 2022 — MSMQ', status: 'in_remediation',
    discovered_at: '2025-07-20T15:00:00Z', resolved_at: null,
  },
  {
    id: 'v9', asset_id: 'a5', asset_name: 'Firewall Perimetral FortiGate',
    cve_id: 'CVE-2024-21762', title: 'FortiOS — RCE sin Autenticación (Out-of-Bounds Write)',
    description: 'Vulnerabilidad crítica en FortiOS SSL-VPN que permite a un atacante remoto no autenticado ejecutar código arbitrario mediante solicitudes HTTP especialmente diseñadas.',
    severity: 'critical', cvss_score: 9.6, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    affected_component: 'FortiOS 7.4.2 SSL-VPN', status: 'open',
    discovered_at: '2025-07-24T06:30:00Z', resolved_at: null,
  },
  {
    id: 'v10', asset_id: 'b4', asset_name: 'Servidor de Videoconferencia',
    cve_id: null, title: 'Contraseña débil en panel de administración Jitsi',
    description: 'El panel de administración de Jitsi Meet expone credenciales por defecto (admin/admin) accesibles desde la red interna. Riesgo de toma de control del servicio.',
    severity: 'medium', cvss_score: 6.8, cvss_vector: null,
    affected_component: 'Jitsi Meet 2.0.8719', status: 'open',
    discovered_at: '2025-07-19T12:00:00Z', resolved_at: null,
  },
]

// ─── ESCANEOS ─────────────────────────────────────────────────────────────────

export const MOCK_SCANS: ScanJob[] = [
  {
    id: 's1', target: '190.0.0.0/28', scan_type: 'full', status: 'completed',
    celery_task_id: 'abc-111', asset_id: 'a1',
    started_at: '2025-07-24T08:00:00Z', completed_at: '2025-07-24T08:22:00Z',
    error_message: null, created_at: '2025-07-24T07:58:00Z',
  },
  {
    id: 's2', target: '192.168.10.0/24', scan_type: 'quick', status: 'completed',
    celery_task_id: 'abc-222', asset_id: 'a4',
    started_at: '2025-07-23T20:00:00Z', completed_at: '2025-07-23T20:08:00Z',
    error_message: null, created_at: '2025-07-23T19:58:00Z',
  },
  {
    id: 's3', target: '200.0.0.0/28', scan_type: 'full', status: 'completed',
    celery_task_id: 'abc-333', asset_id: 'b1',
    started_at: '2025-07-22T10:00:00Z', completed_at: '2025-07-22T10:34:00Z',
    error_message: null, created_at: '2025-07-22T09:58:00Z',
  },
  {
    id: 's4', target: '190.0.0.0/28', scan_type: 'scheduled', status: 'running',
    celery_task_id: 'abc-444', asset_id: null,
    started_at: '2025-07-25T02:00:00Z', completed_at: null,
    error_message: null, created_at: '2025-07-25T02:00:00Z',
  },
]

// ─── REPORTES ─────────────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r1', title: 'Evaluación ISO 27001 — UMG Q3 2025',
    standard: 'iso27001', format: 'pdf', status: 'ready',
    signed: true, file_path: '/reports/r1.pdf', created_at: '2025-07-20T09:00:00Z',
  },
  {
    id: 'r2', title: 'NIST CSF 2.0 — USAC Semestral',
    standard: 'nist', format: 'pdf', status: 'ready',
    signed: false, file_path: '/reports/r2.pdf', created_at: '2025-07-15T14:00:00Z',
  },
  {
    id: 'r3', title: 'CIS Controls v8 — Auditoría Interna UMG',
    standard: 'cis', format: 'pdf', status: 'ready',
    signed: true, file_path: '/reports/r3.pdf', created_at: '2025-07-10T11:00:00Z',
  },
  {
    id: 'r4', title: 'Ley Ciberseguridad GT — Cumplimiento USAC',
    standard: 'ley_gt', format: 'pdf', status: 'generating',
    signed: false, file_path: null, created_at: '2025-07-25T01:00:00Z',
  },
]

// ─── ALERTAS XDR ──────────────────────────────────────────────────────────────

export const MOCK_XDR_ALERTS: XDRAlert[] = [
  {
    id: 'xdr1', type: 'alert', severity: 'critical',
    title: 'Intento de explotación Log4Shell detectado',
    source: 'network', asset_id: 'a1',
    description: 'Petición HTTP con payload JNDI malicioso bloqueada por WAF. IP origen: 185.220.101.45 (TOR exit node).',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'xdr2', type: 'alert', severity: 'high',
    title: 'Escaneo de puertos masivo desde IP externa',
    source: 'network', asset_id: 'a5',
    description: '12,450 paquetes SYN en 30 segundos desde 91.189.91.42. Posible reconocimiento previo a ataque.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'xdr3', type: 'alert', severity: 'high',
    title: 'Autenticación fallida repetida — cuenta admin@umg.edu.gt',
    source: 'identity', asset_id: 'a2',
    description: '47 intentos de login fallidos en 5 minutos. Posible ataque de fuerza bruta. Cuenta bloqueada automáticamente.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'xdr4', type: 'alert', severity: 'medium',
    title: 'Transferencia inusual de datos — BD Académica',
    source: 'endpoint', asset_id: 'a2',
    description: 'Exportación de 2.3 GB desde la BD en horario no laboral (03:15 AM). Usuario: srv_backup. Revisar.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
]

// ─── MÉTRICAS DASHBOARD ───────────────────────────────────────────────────────

export const MOCK_DASHBOARD_METRICS = {
  total_assets: 10,
  critical_vulnerabilities: 4,
  high_vulnerabilities: 4,
  open_vulnerabilities: 8,
  resolved_last_30d: 3,
  active_scans: 1,
  assets_by_criticality: [
    { name: 'Alta', value: 7 },
    { name: 'Media', value: 3 },
    { name: 'Baja', value: 0 },
  ],
  vulns_by_severity: [
    { name: 'Crítica', value: 4, color: '#ef4444' },
    { name: 'Alta', value: 4, color: '#f97316' },
    { name: 'Media', value: 1, color: '#eab308' },
    { name: 'Resuelta', value: 3, color: '#22c55e' },
  ],
  scans_last_7d: [
    { date: 'Dom', count: 1 }, { date: 'Lun', count: 2 },
    { date: 'Mar', count: 3 }, { date: 'Mié', count: 1 },
    { date: 'Jue', count: 4 }, { date: 'Vie', count: 2 },
    { date: 'Sáb', count: 1 },
  ],
}

// ─── USUARIOS DEMO ────────────────────────────────────────────────────────────

export const DEMO_USERS = [
  {
    email: 'admin@umg.edu.gt',
    password: 'Demo2025!',
    profile: {
      id: 'u1', email: 'admin@umg.edu.gt',
      full_name: 'Edvin De León — Admin UMG',
      role: 'admin' as const,
      organization_id: 'org-umg',
      mfa_enabled: true,
    },
    org: 'UMG (Privada)',
    plan: 'premium',
    assets: MOCK_ASSETS,
  },
  {
    email: 'admin@usac.edu.gt',
    password: 'Demo2025!',
    profile: {
      id: 'u2', email: 'admin@usac.edu.gt',
      full_name: 'Administrador USAC',
      role: 'admin' as const,
      organization_id: 'org-usac',
      mfa_enabled: true,
    },
    org: 'USAC (Pública)',
    plan: 'standard',
    assets: MOCK_ASSETS_USAC,
  },
  {
    email: 'analista@umg.edu.gt',
    password: 'Demo2025!',
    profile: {
      id: 'u3', email: 'analista@umg.edu.gt',
      full_name: 'Analista de Seguridad UMG',
      role: 'analyst' as const,
      organization_id: 'org-umg',
      mfa_enabled: true,
    },
    org: 'UMG (Privada)',
    plan: 'premium',
    assets: MOCK_ASSETS,
  },
]
