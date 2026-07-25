# Tasks — Plataforma de Ciberseguridad con IA

## Fase 1: Infraestructura Base

- [x] **T-01:** Crear estructura de directorios del proyecto (backend, frontend, docker)
- [x] **T-02:** Crear steering file con contexto técnico del proyecto
- [x] **T-03:** Crear spec completo (requirements, design, tasks)
- [ ] **T-04:** Crear `docker-compose.yml` con todos los servicios (postgres, redis, ollama, api, worker, nginx, frontend)
- [ ] **T-05:** Crear `docker-compose.dev.yml` con overrides para desarrollo (hot-reload, puertos expuestos)
- [ ] **T-06:** Crear `Dockerfile` para el backend FastAPI
- [ ] **T-07:** Crear `Dockerfile` para el frontend React

## Fase 2: Backend — Núcleo

- [x] **T-08:** Crear `backend/app/core/config.py` con `pydantic-settings` (todas las env vars)
- [x] **T-09:** Crear `backend/app/db/session.py` y `backend/app/db/base.py` (SQLAlchemy async)
- [x] **T-10:** Crear modelos SQLAlchemy: Organization, User, OTPToken, RefreshToken
- [x] **T-11:** Crear modelos SQLAlchemy: Asset, ScanJob, Vulnerability, AIRemediationSuggestion
- [x] **T-12:** Crear modelos SQLAlchemy: Report, FeatureFlag, AuditLog
- [ ] **T-13:** Configurar Alembic para migraciones y crear migración inicial
- [x] **T-14:** Crear `backend/app/core/security.py` (JWT, bcrypt, OTP generation)
- [x] **T-15:** Crear `backend/app/core/dependencies.py` (get_current_user, require_feature, require_role)
- [ ] **T-16:** Crear `backend/app/core/celery_app.py` (configuración Celery + Redis)

## Fase 3: Backend — Servicios

- [x] **T-17:** Crear `backend/app/services/auth_service.py` (login, OTP, refresh, logout)
- [ ] **T-18:** Crear `backend/app/services/email_service.py` (envío de OTP por correo)
- [x] **T-19:** Crear `backend/app/services/scanner/nmap_service.py` (escaneo Nmap)
- [x] **T-20:** Crear `backend/app/services/scanner/nvd_service.py` (lookup de CVEs en NVD)
- [x] **T-21:** Crear `backend/app/services/scanner/scan_tasks.py` (tareas Celery para escaneos)
- [x] **T-22:** Crear `backend/app/services/ai/ollama_service.py` (cliente Ollama + prompt engineering)
- [x] **T-23:** Crear `backend/app/services/ai/remediation_service.py` (lógica de remediación IA)
- [x] **T-24:** Crear `backend/app/services/reports/pdf_service.py` (generación PDF con ReportLab)
- [x] **T-25:** Crear `backend/app/services/reports/report_tasks.py` (tarea Celery para reportes)
- [x] **T-26:** Crear `backend/app/services/feature_flag_service.py` (lectura y caché de flags)
- [x] **T-27:** Crear `backend/app/services/audit_service.py` (registro de acciones auditables)

## Fase 4: Backend — Rutas API

- [x] **T-28:** Crear `backend/app/api/routes/auth.py` (login, verify-otp, refresh, logout, sessions)
- [x] **T-29:** Crear `backend/app/api/routes/assets.py` (CRUD activos)
- [x] **T-30:** Crear `backend/app/api/routes/scans.py` (iniciar, listar, cancelar)
- [x] **T-31:** Crear `backend/app/api/routes/vulnerabilities.py` (listar, detallar, remediar con IA)
- [x] **T-32:** Crear `backend/app/api/routes/reports.py` (generar, descargar, firmar)
- [x] **T-33:** Crear `backend/app/api/routes/admin.py` (organizations, feature flags, audit logs)
- [x] **T-34:** Crear `backend/app/api/routes/websocket.py` (stream XDR alertas)
- [x] **T-35:** Crear `backend/app/api/__init__.py` y router principal que agrupa todas las rutas
- [x] **T-36:** Crear `backend/app/main.py` (app FastAPI, middlewares, CORS, startup events)

## Fase 5: Frontend — Estructura Base

- [x] **T-37:** Inicializar proyecto React + Vite + TypeScript con Tailwind CSS
- [x] **T-38:** Configurar React Router v6 con rutas protegidas por autenticación y rol
- [x] **T-39:** Crear `frontend/src/api/client.ts` (Axios con interceptores JWT + refresh automático)
- [x] **T-40:** Crear stores Zustand: authStore, featureStore
- [x] **T-41:** Crear stores Zustand: assetStore, vulnStore, scanStore, alertStore
- [x] **T-42:** Crear tipos TypeScript para todas las entidades del dominio

## Fase 6: Frontend — Páginas y Componentes

- [x] **T-43:** Crear `LoginPage` con flujo de 2FA (paso 1: credenciales, paso 2: OTP)
- [x] **T-44:** Crear `DashboardPage` con métricas resumen y gráficos Recharts
- [x] **T-45:** Crear `AssetsPage` con tabla filtrable e inventario de activos
- [x] **T-46:** Crear `AssetDetailPage` con vulnerabilidades asociadas y mapa de dependencias
- [x] **T-47:** Crear `ScansPage` con historial y formulario de nuevo escaneo
- [x] **T-48:** Crear `VulnerabilitiesPage` con tabla filtrable por severidad y estado
- [x] **T-49:** Crear `VulnDetailPage` con panel de remediación IA integrado
- [x] **T-50:** Crear `ReportsPage` con generación y descarga de reportes
- [x] **T-51:** Crear `XDRPage` con feed de alertas en tiempo real (WebSocket) [Premium+]
- [x] **T-52:** Crear `AdminPage` con gestión de feature flags por tenant [Admin]
- [x] **T-53:** Crear páginas de demo: `DemoHospitalPage` y `DemoGobiernoPage`
- [x] **T-54:** Crear componentes UI reutilizables: Navbar, Sidebar, ProtectedRoute, FeatureGuard

## Fase 7: Configuración y Despliegue

- [x] **T-55:** Crear `backend/requirements.txt` con todas las dependencias Python fijadas
- [x] **T-56:** Crear `.env.example` con todas las variables de entorno documentadas
- [ ] **T-57:** Crear `nginx/nginx.conf` con configuración TLS y proxy inverso
- [ ] **T-58:** Crear `nginx/certs/` con instrucciones para certificados (Let's Encrypt / self-signed dev)
- [ ] **T-59:** Crear `.github/workflows/ci.yml` con pipeline CI (lint, tests, build)
- [ ] **T-60:** Crear script de inicialización de datos demo (`backend/scripts/seed_demo.py`)

## Fase 8: Calidad y Documentación

- [ ] **T-61:** Crear `backend/tests/` con pruebas unitarias para auth, scanner y AI service
- [ ] **T-62:** Crear `backend/tests/` con pruebas de integración para los endpoints principales
- [ ] **T-63:** Documentar variables de entorno críticas y procedimiento de despliegue
- [ ] **T-64:** Crear runbook de operaciones: backup BD, rotación de tokens, actualización de modelos Ollama
