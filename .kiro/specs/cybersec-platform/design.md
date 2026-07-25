# Design — Plataforma de Ciberseguridad con IA

## Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                    │
│              React 18 + Vite + TypeScript                │
│         Tailwind CSS / shadcn/ui / Recharts              │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS + WebSocket
┌──────────────────────▼───────────────────────────────────┐
│                   NGINX (Reverse Proxy)                  │
│              TLS termination / Rate Limiting             │
└──────────┬───────────────────────────┬───────────────────┘
           │ HTTP/REST                 │ WS
┌──────────▼───────────┐   ┌───────────▼──────────────────┐
│   FastAPI App         │   │   WebSocket Server (FastAPI) │
│   (Uvicorn/Gunicorn)  │   │   XDR Alertas en tiempo real │
└──────────┬───────────┘   └──────────────────────────────┘
           │
    ┌──────┴──────────────────────────────┐
    │         Capa de Servicios           │
    ├─────────────┬───────────┬───────────┤
    │  Auth/2FA   │  Scanner  │  Reports  │
    │  JWT + OTP  │  Nmap/CVE │  PDF Gen  │
    └──────┬──────┴─────┬─────┴───────────┘
           │            │ Celery Tasks
    ┌──────▼──────┐  ┌──▼──────────────┐
    │ PostgreSQL  │  │  Redis (Cache   │
    │ (Amazon RDS)│  │  + Task Queue)  │
    └─────────────┘  └─────────────────┘
           │
    ┌──────▼──────────────────────────────┐
    │       Ollama (Docker Container)     │
    │  Llama 3 / Mistral / DeepSeek       │
    │  GPU: NVIDIA H100 (CUDA)            │
    └─────────────────────────────────────┘
```

## Modelo de Datos

### Entidades Principales

#### Organization (Tenant)
```
id: UUID PK
name: str
sector: enum (hospital, gobierno, banca, pyme)
plan: enum (standard, premium, enterprise)
created_at: datetime
is_active: bool
```

#### User
```
id: UUID PK
organization_id: UUID FK
email: str (unique)
password_hash: str
role: enum (admin, analyst, viewer, auditor)
is_active: bool
last_login: datetime
failed_attempts: int
mfa_enabled: bool
```

#### OTPToken
```
id: UUID PK
user_id: UUID FK
token: str (6 chars alfanumérico)
expires_at: datetime
used: bool
created_at: datetime
```

#### RefreshToken
```
id: UUID PK
user_id: UUID FK
token_hash: str
ip_address: str
user_agent: str
expires_at: datetime
revoked: bool
```

#### Asset
```
id: UUID PK
organization_id: UUID FK
name: str
asset_type: enum (server, vm, container, endpoint, cloud_service)
ip_address: str (nullable)
hostname: str (nullable)
os: str (nullable)
criticality: enum (alta, media, baja)
sector_tag: str (nullable)
is_active: bool
last_scanned: datetime (nullable)
created_at: datetime
```

#### ScanJob
```
id: UUID PK
organization_id: UUID FK
target: str (IP range / CIDR)
status: enum (pending, running, completed, failed)
scan_type: enum (quick, full, scheduled)
celery_task_id: str (nullable)
started_at: datetime (nullable)
completed_at: datetime (nullable)
created_by: UUID FK (User)
created_at: datetime
```

#### Vulnerability
```
id: UUID PK
asset_id: UUID FK
cve_id: str (nullable)
title: str
description: text
severity: enum (critical, high, medium, low, info)
cvss_score: float (nullable)
status: enum (open, in_remediation, resolved, accepted)
discovered_at: datetime
resolved_at: datetime (nullable)
```

#### AIRemediationSuggestion
```
id: UUID PK
vulnerability_id: UUID FK
model_used: str
prompt_tokens: int
response_tokens: int
suggestion: text (JSON structured)
mode: enum (technical, explain)
created_at: datetime
```

#### Report
```
id: UUID PK
organization_id: UUID FK
title: str
standard: enum (iso27001, nist, cis, ley_gt)
format: enum (pdf, csv, json)
file_path: str (nullable)
status: enum (pending, generating, ready, failed)
generated_by: UUID FK (User)
signed: bool
created_at: datetime
```

#### FeatureFlag
```
id: UUID PK
organization_id: UUID FK
feature: enum (ai_remediation, xdr, auto_remediation, dedicated_infra, advanced_compliance)
enabled: bool
updated_at: datetime
updated_by: UUID FK (User)
```

#### AuditLog
```
id: UUID PK
organization_id: UUID FK
user_id: UUID FK (nullable)
action: str
resource_type: str
resource_id: str (nullable)
ip_address: str
details: JSON
created_at: datetime
```

## API Design

### Endpoints

#### Auth — `/api/v1/auth`
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/login` | Primer factor (email + password) | Público |
| POST | `/verify-otp` | Segundo factor (OTP) → emite JWT | Público |
| POST | `/refresh` | Renovar access token | Autenticado |
| POST | `/logout` | Revocar refresh token | Autenticado |
| GET | `/sessions` | Listar sesiones activas | Admin |
| DELETE | `/sessions/{id}` | Revocar sesión específica | Admin |

#### Assets — `/api/v1/assets`
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| GET | `/` | Listar activos del tenant | Analyst+ |
| POST | `/` | Crear activo manual | Admin, Analyst |
| GET | `/{id}` | Detalle de activo | Analyst+ |
| PUT | `/{id}` | Actualizar activo | Admin, Analyst |
| DELETE | `/{id}` | Eliminar activo | Admin |
| GET | `/{id}/vulnerabilities` | Vulnerabilidades del activo | Analyst+ |

#### Scans — `/api/v1/scans`
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/` | Iniciar escaneo | Admin, Analyst |
| GET | `/` | Historial de escaneos | Analyst+ |
| GET | `/{id}` | Estado del escaneo | Analyst+ |
| POST | `/{id}/cancel` | Cancelar escaneo | Admin |

#### Vulnerabilities — `/api/v1/vulnerabilities`
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| GET | `/` | Listar (filtros: severidad, estado) | Analyst+ |
| GET | `/{id}` | Detalle | Analyst+ |
| PATCH | `/{id}/status` | Actualizar estado | Analyst+ |
| POST | `/{id}/remediate` | Solicitar sugerencia IA | Premium+ |
| GET | `/{id}/suggestions` | Historial sugerencias IA | Premium+ |

#### Reports — `/api/v1/reports`
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/` | Generar reporte | Admin, Auditor |
| GET | `/` | Listar reportes | Admin, Auditor |
| GET | `/{id}/download` | Descargar archivo | Admin, Auditor |
| POST | `/{id}/sign` | Firmar digitalmente | Admin |

#### Admin — `/api/v1/admin`
| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| GET | `/organizations` | Listar tenants | SuperAdmin |
| PATCH | `/organizations/{id}/plan` | Cambiar plan | SuperAdmin |
| GET | `/feature-flags/{org_id}` | Ver flags del tenant | Admin+ |
| PATCH | `/feature-flags/{org_id}` | Actualizar flags | SuperAdmin |
| GET | `/audit-logs` | Logs de auditoría | Admin, Auditor |

#### WebSocket — `/ws/v1`
| Ruta | Descripción |
|------|-------------|
| `/alerts` | Stream XDR de alertas en tiempo real |

## Flujos Principales

### Flujo de Autenticación 2FA
```
1. POST /auth/login → valida credenciales → genera OTP → envía email
2. POST /auth/verify-otp → valida OTP (TTL 10 min) → emite access + refresh token
3. Cada request: Bearer token en header Authorization
4. Access token expirado → POST /auth/refresh con refresh token
5. Logout → revoca refresh token en BD
```

### Flujo de Escaneo
```
1. POST /scans → crea ScanJob en BD (status: pending)
2. API despacha tarea Celery → retorna job_id al cliente
3. Celery worker ejecuta Nmap sobre el target
4. Resultados cruzados con NVD API → crea Vulnerability records
5. Celery actualiza ScanJob.status = completed
6. Cliente hace polling GET /scans/{id} o recibe push via WS
```

### Flujo de Remediación IA
```
1. POST /vulnerabilities/{id}/remediate
2. Verifica feature flag: ai_remediation == true
3. Construye prompt con contexto: CVE, CVSS, asset info, OS
4. POST http://ollama:11434/api/generate → LLM local
5. Parsea respuesta JSON estructurada
6. Guarda AIRemediationSuggestion en BD
7. Retorna sugerencia al cliente
```

## Arquitectura Frontend

### Estructura de Páginas
```
/login              → LoginPage (2FA flow)
/dashboard          → DashboardPage (métricas resumen)
/assets             → AssetsPage (inventario)
/assets/:id         → AssetDetailPage
/scans              → ScansPage (historial + nuevo escaneo)
/vulnerabilities    → VulnerabilitiesPage (tabla filtrable)
/vulnerabilities/:id → VulnDetailPage (+ panel IA)
/reports            → ReportsPage
/xdr                → XDRPage (alertas live) [Premium+]
/admin              → AdminPage (feature flags, usuarios) [Admin]
/demo/hospital      → DemoHospitalPage
/demo/gobierno      → DemoGobiernoPage
```

### Estado Global (Zustand)
```
authStore:     { user, tokens, isAuthenticated, login, logout }
assetStore:    { assets, currentAsset, filters }
vulnStore:     { vulnerabilities, filters, pagination }
scanStore:     { jobs, activeScan }
alertStore:    { alerts, wsConnection }
featureStore:  { flags, hasFeature(name) }
```

## Seguridad por Capas

| Capa | Mecanismo |
|------|-----------|
| Red | TLS 1.3, NGINX rate limiting |
| Aplicación | JWT + 2FA, RBAC, feature flags |
| Datos | bcrypt, Fernet, queries parametrizadas |
| IA | LLM local (Ollama), sin exfiltración de datos |
| Auditoría | Logs inmutables de todas las acciones |
| Infraestructura | Docker network isolation, secrets en env vars |

## Docker Compose Services

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `nginx` | 80, 443 | Reverse proxy + TLS |
| `api` | 8000 | FastAPI backend |
| `worker` | — | Celery worker |
| `beat` | — | Celery beat (tareas programadas) |
| `postgres` | 5432 | Base de datos principal |
| `redis` | 6379 | Cache + broker Celery |
| `ollama` | 11434 | LLM soberano (GPU) |
| `frontend` | 3000 | React dev server / Nginx prod |
