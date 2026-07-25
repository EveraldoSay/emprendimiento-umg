# CyberSec AI Platform — Guía de Arranque

Universidad Mariano Gálvez de Guatemala  
Maestría en Seguridad Informática — Emprendimiento Empresarial

---

## Opción A — Demo en GitHub Pages (sin instalar nada, solo para mostrar)

> Funciona al 100% para presentaciones, focus group y que amigos interactúen.
> No requiere backend, Docker, ni base de datos.

### Paso 1 — Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repo: `cybersec-ai-demo` (o el que prefieras)
3. Visibilidad: **Public** (requerido para GitHub Pages gratis)
4. Crear el repositorio

### Paso 2 — Conectar y subir el código

Ejecuta desde la raíz del proyecto (carpeta principal):

```powershell
git init
git add .
git commit -m "feat: CyberSec AI Platform initial commit"
git remote add origin https://github.com/TU_USUARIO/cybersec-ai-demo.git
git push -u origin main
```

### Paso 3 — Deploy al demo

```powershell
cd frontend
npm install --legacy-peer-deps
.\deploy-ghpages.ps1
```

> Si el nombre de tu repo es diferente a `cybersec-ai-demo`,
> edita la variable `$REPO_NAME` en `deploy-ghpages.ps1` antes de correrlo.

### Paso 4 — Habilitar GitHub Pages

1. Ve a tu repo en GitHub → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `/ (root)`
4. Guardar

### Tu demo estará en:
```
https://TU_USUARIO.github.io/cybersec-ai-demo/
```

### Credenciales de demo
| Perfil | Email | Entidad | Plan |
|--------|-------|---------|------|
| Admin UMG | admin@umg.edu.gt | Universidad Mariano Gálvez (Privada) | Premium |
| Admin USAC | admin@usac.edu.gt | Universidad de San Carlos (Pública) | Standard |
| Analista UMG | analista@umg.edu.gt | Universidad Mariano Gálvez (Privada) | Premium |

**Contraseña:** `Demo2025!` (en modo demo no se valida, solo haz clic en el perfil)

---

## Opción B — Desarrollo local (frontend + backend completo)

### Prerrequisitos
- Python 3.11+
- Node.js 22+
- Docker Desktop
- PostgreSQL local (o usa Docker)

### Backend

```powershell
cd backend

# 1. Crear entorno virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
copy ..\env.example .env
# Edita .env con tus datos (DB, SMTP, JWT_SECRET_KEY, etc.)

# 4. Migrar base de datos
alembic upgrade head

# 5. Cargar datos demo
python -m scripts.seed_demo

# 6. Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

El backend estará en: http://localhost:8000/api/docs

### Frontend (modo real, con backend)

```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```

La app estará en: http://localhost:3000

### Ollama (IA soberana)

```powershell
# Instalar Ollama: https://ollama.com/download
ollama pull llama3
ollama serve
```

### Con Docker (todo junto)

```powershell
# Desde la raíz del proyecto
copy .env.example .env
# Edita .env

docker compose up -d

# Primera vez: migrar y seed
docker compose exec api alembic upgrade head
docker compose exec api python -m scripts.seed_demo
```

Servicios levantados:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Ollama: http://localhost:11434
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Opción C — Amigos levantando local

Cada amigo debe:

1. Clonar el repo
2. Copiar `.env.example` a `.env`
3. Configurar su propio SMTP en `.env` (su Gmail + App Password)
4. Ejecutar con Docker: `docker compose up -d`

**Límite de correos OTP con Gmail:** ~500/día por cuenta.  
Si se usan muchas cuentas, considera [Resend](https://resend.com) (gratis 3,000/mes).

---

## Qué funciona en cada modo

| Funcionalidad | GitHub Pages | Local + Backend |
|---------------|:---:|:---:|
| Login demo (perfiles) | ✅ | — |
| Login real (2FA por correo) | ❌ | ✅ |
| Dashboard con gráficos | ✅ | ✅ |
| Inventario de activos UMG / USAC | ✅ | ✅ |
| Tabla de vulnerabilidades (CVEs reales) | ✅ | ✅ |
| Panel de remediación IA | ✅ mock | ✅ real (Ollama) |
| Escaneo Nmap real | ❌ | ✅ |
| Reportes PDF descargables | ❌ | ✅ |
| Alertas XDR en tiempo real | ✅ simulado | ✅ real (WebSocket) |
| Feature flags toggle | ✅ | ✅ |
| Demo Hospital / Gobierno | ✅ | ✅ |

---

## Estructura del proyecto

```
/
├── backend/                  # FastAPI — Python 3.11
│   ├── app/
│   │   ├── api/routes/       # Endpoints REST + WebSocket
│   │   ├── core/             # Config, JWT, seguridad, Celery
│   │   ├── db/               # SQLAlchemy async
│   │   ├── models/           # 11 modelos (Organization, User, Asset, Vuln, etc.)
│   │   └── services/         # Auth, Scanner, AI (Ollama), Reports, FeatureFlags
│   ├── migrations/           # Alembic
│   └── scripts/seed_demo.py  # Datos demo
├── frontend/                 # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── api/              # Axios + interceptor mock
│   │   ├── pages/            # 9 páginas + 2 demos sectoriales
│   │   ├── store/            # Zustand: auth, features, alerts
│   │   └── types/            # Interfaces TypeScript
│   └── deploy-ghpages.ps1    # Script de deploy
├── docker/                   # Dockerfiles + Nginx
├── docker-compose.yml        # Orquestación completa
└── .env.example              # Plantilla de variables
```

---

## Estándares cubiertos en el sistema

| Estándar | Cobertura |
|----------|-----------|
| **ISO/IEC 27001:2022** | A.8 Activos, A.9 Acceso, A.12 Operaciones, A.16 Incidentes |
| **NIST CSF 2.0** | Identify, Protect, Detect, Respond, Recover |
| **CIS Controls v8** | Control 1 (Inventario), 3 (Datos), 6 (Acceso), 7 (Vulns) |
| **OWASP Top 10** | Reportes de riesgo por categoría OWASP |
| **MITRE ATT&CK** | Alertas XDR referenciadas con técnicas ATT&CK |
| **Ley Ciberseguridad GT** | Notificación incidentes, infraestructura crítica |
