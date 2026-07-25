"""Router principal de la API v1."""

from fastapi import APIRouter
from app.api.routes import auth, assets, scans, vulnerabilities, reports, admin, websocket

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(assets.router)
api_router.include_router(scans.router)
api_router.include_router(vulnerabilities.router)
api_router.include_router(reports.router)
api_router.include_router(admin.router)

# WebSocket va directamente en la app (sin prefijo /api/v1)
ws_router = APIRouter()
ws_router.include_router(websocket.router)
