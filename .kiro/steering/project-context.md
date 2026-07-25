# Plataforma de Ciberseguridad con IA — Contexto del Proyecto

## Visión General

Plataforma SaaS modular de ciberseguridad con inteligencia artificial soberana (sin dependencia de APIs externas de pago). Orientada a sectores público y privado en Guatemala y LATAM, con cumplimiento de ISO 27001, NIST, CIS y la Ley de Ciberseguridad de Guatemala.

## Stack Tecnológico

### Backend
- **Lenguaje:** Python 3.11+
- **Framework:** FastAPI (async, alta performance)
- **ORM:** SQLAlchemy 2.x con migraciones Alembic
- **Base de datos principal:** PostgreSQL (Amazon RDS en producción, PostgreSQL local en desarrollo)
- **Caché / Rate limiting:** Redis
- **Autenticación:** JWT (access + refresh tokens), 2FA vía tokens OTP enviados por correo
- **Cifrado:** TLS/SSL en tránsito; datos sensibles en reposo cifrados con Fernet (cryptography)
- **Task queue:** Celery + Redis para escaneos asincrónicos y generación de reportes

### IA Soberana
- **Runtime:** Ollama ejecutado en contenedor Docker
- **Modelos soportados:** Llama 3, Mistral 7B, DeepSeek-Coder
- **Aceleración:** NVIDIA GPU (CUDA) para inferencia; CPU como fallback
- **Integración Python:** `ollama` SDK o llamadas HTTP directas a `http://ollama:11434`
- **Restricción clave:** NINGÚN dato de clientes sale a APIs externas de IA (OpenAI, Anthropic, etc.)

### Frontend
- **Framework:** React 18 + Vite
- **Lenguaje:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **Gráficos:** Recharts (dashboards interactivos)
- **Estado global:** Zustand
- **HTTP client:** Axios con interceptores JWT
- **Routing:** React Router v6

### Infraestructura y DevOps
- **Contenedores:** Docker + Docker Compose
- **IA runtime:** Ollama con soporte GPU (nvidia-container-toolkit)
- **Cloud opcional:** Amazon RDS (PostgreSQL), Amazon S3 (reportes PDF)
- **CI/CD:** GitHub Actions
- **Secretos:** Variables de entorno (.env), nunca hardcodeadas

## Módulos Funcionales

### 1. Autenticación y Seguridad de Acceso (Zero Trust)
- Login con usuario/contraseña (bcrypt hash)
- 2FA obligatorio: OTP alfanumérico enviado al correo institucional
- JWT con access token (15 min) + refresh token (7 días)
- Gestión de sesiones: detección de IP anómala, revocación de tokens
- RBAC: roles `admin`, `analyst`, `viewer`, `auditor`

### 2. Descubrimiento y Escaneo Agentless
- Escaneo de red sin agentes instalados en hosts
- Integración con Nmap (Python: `python-nmap`) para descubrimiento de activos
- Detección de CVEs mediante base de datos NVD (National Vulnerability Database)
- Escaneos programables (cron) y bajo demanda
- Cola asincrónica con Celery para no bloquear la API

### 3. Motor de Remediación con IA
- Consulta al LLM local (Ollama) con contexto de la vulnerabilidad detectada
- Prompt engineering para respuestas estructuradas: severidad, pasos de remediación, referencias
- Historial de sugerencias por activo
- Modo `explain` para usuarios no técnicos (directivos)

### 4. XDR — Detección y Respuesta Extendida
- Correlación de eventos de endpoints, red e identidad
- Alertas en tiempo real vía WebSocket
- Playbooks de respuesta automática (aislamiento de host, bloqueo de IP)
- Integración con logs de sistemas (syslog, Windows Event Log)

### 5. Reportes Multi-estándar
- Generación de PDF con WeasyPrint o ReportLab
- Plantillas para: ISO 27001, NIST CSF, CIS Controls, Ley Ciberseguridad Guatemala
- Firma digital de reportes (para auditorías)
- Exportación a CSV/JSON para herramientas SIEM

### 6. Gestión de Activos
- Inventario de: servidores, VMs, contenedores, endpoints, servicios cloud
- Clasificación por criticidad (Alta/Media/Baja)
- Mapa de dependencias entre activos
- Etiquetado por sector (Hospital, Gobierno, Banca)

### 7. Feature Flags y Planes de Suscripción
- Feature flags almacenados en BD por organización
- Planes: `standard`, `premium`, `enterprise`
- Control granular por feature: `ai_remediation`, `xdr`, `auto_remediation`, `dedicated_infra`, `advanced_compliance`
- Consola de admin para activar/desactivar features por tenant

## Estructura de Planes

| Plan | Features activas | Segmento |
|------|-----------------|----------|
| Standard | Escaneo, inventario, reportes básicos | Pymes, municipalidades |
| Premium (AI Assisted) | + IA remediación, remediaciones automáticas, soporte 24/7 | Hospitales, bancos |
| Enterprise (Sovereign) | + Infraestructura Docker dedicada, API personalizada, compliance avanzado | SAT, MP, grandes corporaciones |

## Entornos de Demostración

- **sector_hospital:** Datos clínicos bajo HIPAA, IA detecta riesgos en docs de pacientes
- **sector_gobierno:** Consola GovTech, transparencia administrativa, protección de datos poblacionales

## Convenciones de Código

- **Python:** PEP 8, type hints obligatorios, docstrings en español
- **TypeScript:** Strict mode, interfaces explícitas, no `any`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- **Variables de entorno:** Todas en `.env`, referenciadas via `pydantic-settings`
- **Seguridad:** Nunca loguear tokens, contraseñas ni datos PII en logs
- **Queries SQL:** Siempre parametrizadas (ORM), nunca interpolación de strings
- **CORS:** Solo orígenes explícitamente permitidos en `.env`

## Estructura de Directorios

```
/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/routes/       # Endpoints por módulo
│   │   ├── core/             # Config, security, dependencies
│   │   ├── db/               # Session, base model
│   │   ├── models/           # SQLAlchemy models
│   │   └── services/         # Lógica de negocio
│   │       ├── ai/           # Ollama integration
│   │       ├── scanner/      # Nmap, CVE lookup
│   │       └── reports/      # PDF generation
│   ├── migrations/           # Alembic
│   └── tests/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # UI reutilizables
│   │   ├── pages/            # Vistas por módulo
│   │   ├── store/            # Zustand stores
│   │   ├── api/              # Axios clients
│   │   └── types/            # TypeScript interfaces
│   └── public/
├── docker/                   # Dockerfiles individuales
├── docker-compose.yml        # Orquestación completa
├── docker-compose.dev.yml    # Override para desarrollo
└── .kiro/                    # Configuración Kiro
```
