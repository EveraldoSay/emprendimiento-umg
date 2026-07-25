# =============================================================================
# deploy-ghpages.ps1  —  CyberSec AI Platform
# Publica el build demo estático en GitHub Pages.
#
# ANTES DE CORRER:
#   Edita $REPO_NAME con el nombre exacto de tu repositorio GitHub.
#   Ejemplo: si el repo se llama "emprendimiento-umg" → deja ese valor.
#   NO uses espacios ni tildes. Solo letras, números y guiones.
#
# CÓMO CORRER:
#   Abre PowerShell en la carpeta /frontend y ejecuta:
#       .\deploy-ghpages.ps1
# =============================================================================

# ▼ CAMBIA ESTO al nombre de tu repositorio GitHub
$REPO_NAME = "emprendimiento-umg"

# ▼ CAMBIA ESTO a tu usuario de GitHub
$GITHUB_USER = "EveraldoSay"

# ==============================================================================
Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CyberSec AI — Deploy a GitHub Pages     " -ForegroundColor Cyan
Write-Host "  Repo : $GITHUB_USER/$REPO_NAME          " -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que estamos en /frontend
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Ejecuta este script desde la carpeta /frontend" -ForegroundColor Red
    exit 1
}

# 2. Actualizar base path en .env.ghpages automáticamente
$envContent = Get-Content ".env.ghpages" -Raw
$envContent = $envContent -replace 'VITE_BASE_PATH=.*',  "VITE_BASE_PATH=/$REPO_NAME/"
$envContent = $envContent -replace 'VITE_API_URL=.*',    "VITE_API_URL=/$REPO_NAME/api/v1"
Set-Content ".env.ghpages" $envContent
Write-Host "[OK] Base path actualizado: /$REPO_NAME/" -ForegroundColor Green

# 3. Instalar dependencias si node_modules no existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[...] Instalando dependencias npm (primera vez, puede tardar 2 min)..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install falló. Revisa tu conexión a internet." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Dependencias instaladas" -ForegroundColor Green
}

# 4. Build modo demo (usa .env.ghpages)
Write-Host "[...] Construyendo build de producción en modo demo..." -ForegroundColor Yellow
npm run build:demo
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] El build falló. Pasos para resolver:" -ForegroundColor Red
    Write-Host "  1. Ejecuta: npm run type-check" -ForegroundColor Yellow
    Write-Host "  2. Corrige los errores TypeScript que aparezcan" -ForegroundColor Yellow
    Write-Host "  3. Vuelve a correr este script" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Build generado en /dist ($((Get-ChildItem dist -Recurse -File).Count) archivos)" -ForegroundColor Green

# 5. Publicar con gh-pages
Write-Host "[...] Publicando en rama gh-pages..." -ForegroundColor Yellow
npx gh-pages -d dist --message "deploy: CyberSec AI demo [skip ci]"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] gh-pages falló. Verifica:" -ForegroundColor Red
    Write-Host "  - Que hayas hecho 'git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git'" -ForegroundColor Yellow
    Write-Host "  - Que tengas permisos de escritura al repo" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host "  DEPLOY EXITOSO                          " -ForegroundColor Green
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  URL del demo (disponible en ~3 minutos):" -ForegroundColor White
Write-Host "  https://$GITHUB_USER.github.io/$REPO_NAME/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Activa GitHub Pages en:" -ForegroundColor Gray
Write-Host "  github.com/$GITHUB_USER/$REPO_NAME → Settings → Pages → Branch: gh-pages" -ForegroundColor Gray
Write-Host ""
