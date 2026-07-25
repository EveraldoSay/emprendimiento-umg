# Requirements — Plataforma de Ciberseguridad con IA

## Introducción

Plataforma SaaS modular de ciberseguridad con IA soberana para Guatemala y LATAM. Permite a organizaciones de los sectores público y privado gestionar vulnerabilidades, activos digitales y cumplimiento normativo sin depender de servicios externos de IA.

## Requisitos Funcionales

### RF-01: Autenticación y Control de Acceso (Zero Trust)

- **RF-01.1:** El sistema DEBE requerir usuario y contraseña con hash bcrypt para el primer factor de autenticación.
- **RF-01.2:** El sistema DEBE generar un OTP alfanumérico de un solo uso y enviarlo al correo institucional del usuario como segundo factor (2FA).
- **RF-01.3:** El sistema DEBE emitir un JWT de acceso (TTL: 15 minutos) y un refresh token (TTL: 7 días) tras autenticación exitosa.
- **RF-01.4:** El sistema DEBE detectar inicios de sesión desde IPs no registradas y requerir revalidación.
- **RF-01.5:** El sistema DEBE implementar RBAC con los roles: `admin`, `analyst`, `viewer`, `auditor`.
- **RF-01.6:** El sistema DEBE permitir revocación inmediata de sesiones activas desde la consola de administración.

### RF-02: Gestión de Activos Digitales

- **RF-02.1:** El sistema DEBE mantener un inventario de activos: servidores, VMs, contenedores, endpoints y servicios cloud.
- **RF-02.2:** El sistema DEBE clasificar activos por criticidad: Alta, Media, Baja.
- **RF-02.3:** El sistema DEBE permitir etiquetar activos por sector (Hospital, Gobierno, Banca, Pyme).
- **RF-02.4:** El sistema DEBE representar dependencias entre activos en un mapa visual.

### RF-03: Escaneo de Vulnerabilidades Agentless

- **RF-03.1:** El sistema DEBE ejecutar escaneos de red sin requerir agentes instalados en los hosts.
- **RF-03.2:** El sistema DEBE usar Nmap para descubrimiento de activos y detección de servicios.
- **RF-03.3:** El sistema DEBE cruzar resultados con la base NVD para identificar CVEs activos.
- **RF-03.4:** El sistema DEBE soportar escaneos bajo demanda y programados (cron).
- **RF-03.5:** Los escaneos DEBEN ejecutarse de forma asincrónica via Celery sin bloquear la API.
- **RF-03.6:** El sistema DEBE mostrar severidad CVSS por cada vulnerabilidad detectada.

### RF-04: Motor de Remediación con IA

- **RF-04.1:** El sistema DEBE consultar al LLM local (Ollama) con el contexto completo de cada vulnerabilidad para generar un plan de remediación.
- **RF-04.2:** Las respuestas de la IA DEBEN incluir: nivel de severidad, pasos ordenados de remediación y referencias técnicas.
- **RF-04.3:** El sistema DEBE mantener un historial de sugerencias IA por activo.
- **RF-04.4:** El sistema DEBE ofrecer un modo `explain` con lenguaje simplificado para usuarios no técnicos.
- **RF-04.5:** El sistema NUNCA DEBE enviar datos de clientes a APIs externas de IA.

### RF-05: XDR — Detección y Respuesta Extendida

- **RF-05.1:** El sistema DEBE correlacionar eventos de endpoints, red e identidad en una vista unificada.
- **RF-05.2:** El sistema DEBE emitir alertas en tiempo real vía WebSocket.
- **RF-05.3:** El sistema DEBE ejecutar playbooks de respuesta automática: aislamiento de host, bloqueo de IP.
- **RF-05.4:** El sistema DEBE ingestar logs de sistemas (syslog, Windows Event Log).

### RF-06: Reportes Multi-estándar

- **RF-06.1:** El sistema DEBE generar reportes PDF alineados con: ISO 27001, NIST CSF, CIS Controls y Ley de Ciberseguridad de Guatemala.
- **RF-06.2:** Los reportes DEBEN poder firmarse digitalmente para uso en auditorías.
- **RF-06.3:** El sistema DEBE exportar datos en CSV y JSON para integración con herramientas SIEM.
- **RF-06.4:** La generación de reportes pesados DEBE ejecutarse en background (Celery).

### RF-07: Feature Flags y Planes de Suscripción

- **RF-07.1:** El sistema DEBE implementar feature flags por organización (tenant) almacenados en base de datos.
- **RF-07.2:** El sistema DEBE soportar tres planes: `standard`, `premium`, `enterprise`.
- **RF-07.3:** Los features controlables DEBEN incluir: `ai_remediation`, `xdr`, `auto_remediation`, `dedicated_infra`, `advanced_compliance`.
- **RF-07.4:** La consola de admin DEBE permitir activar/desactivar features por tenant sin redespliegue.

### RF-08: Entornos de Demostración

- **RF-08.1:** El sistema DEBE incluir un entorno `sector_hospital` con datos clínicos ficticios bajo esquema HIPAA.
- **RF-08.2:** El sistema DEBE incluir un entorno `sector_gobierno` con datos administrativos ficticios bajo esquema GovTech.

## Requisitos No Funcionales

### RNF-01: Seguridad
- Cifrado TLS/SSL obligatorio en todos los endpoints.
- Datos sensibles en reposo cifrados con Fernet.
- Contraseñas hasheadas con bcrypt (work factor ≥ 12).
- Headers de seguridad HTTP: HSTS, CSP, X-Frame-Options, X-Content-Type-Options.
- Rate limiting en endpoints de autenticación (máx. 5 intentos/min por IP).
- Logs de auditoría inmutables para todas las acciones privilegiadas.

### RNF-02: Performance
- Tiempo de respuesta de la API ≤ 200ms para operaciones CRUD.
- Inferencia IA ≤ 10 segundos por consulta en hardware con GPU.
- Soporte para ≥ 500 activos por tenant sin degradación.
- Dashboard principal debe cargar en ≤ 2 segundos.

### RNF-03: Disponibilidad
- SLA objetivo: 99.9% en producción.
- Health checks automáticos para todos los servicios Docker.
- Reconexión automática a Redis y PostgreSQL.

### RNF-04: Escalabilidad
- Arquitectura multi-tenant: datos de cada organización aislados lógicamente.
- Celery workers escalables horizontalmente.
- Soporte para múltiples instancias de la API detrás de un load balancer.

### RNF-05: Soberanía de Datos
- El LLM DEBE ejecutarse localmente en Ollama (Docker).
- Ningún dato de clientes DEBE salir del entorno controlado del cliente.
- Los reportes PDF DEBEN poder almacenarse localmente o en S3 privado.

### RNF-06: Cumplimiento
- ISO 27001: controles A.9 (acceso), A.12 (operaciones), A.16 (incidentes).
- NIST CSF: funciones Identify, Protect, Detect, Respond, Recover.
- CIS Controls v8: implementación de los primeros 6 controles críticos.
- Ley de Ciberseguridad de Guatemala: notificación de incidentes, protección de infraestructura crítica.
