"""Punto de entrada principal de la aplicación FastAPI."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router, ws_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Eventos de inicio y cierre de la aplicación."""
    # Inicio
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} iniciando en modo {settings.ENVIRONMENT}")
    yield
    # Cierre
    await engine.dispose()
    print("✅ Conexiones de base de datos cerradas")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Plataforma SaaS de Ciberseguridad con IA Soberana. "
        "ISO 27001 · NIST CSF · CIS Controls · Ley de Ciberseguridad de Guatemala."
    ),
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ---- Middlewares ----

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)

app.add_middleware(GZipMiddleware, minimum_size=1024)


# ---- Handlers de error globales ----

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Manejador global que evita leakear detalles internos en producción."""
    if settings.DEBUG:
        raise exc
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor"},
    )


# ---- Routers ----

app.include_router(api_router)
app.include_router(ws_router)


# ---- Health check ----

@app.get("/health", tags=["Sistema"], include_in_schema=False)
async def health_check():
    """Endpoint de salud para Docker healthcheck y load balancer."""
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/health/ai", tags=["Sistema"], include_in_schema=False)
async def ai_health_check():
    """Verifica disponibilidad del servidor Ollama."""
    from app.services.ai.ollama_service import OllamaService
    svc = OllamaService()
    is_up = await svc.health_check()
    return {
        "ollama": "up" if is_up else "down",
        "model": settings.OLLAMA_DEFAULT_MODEL,
        "sovereign": True,
    }
