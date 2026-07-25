"""WebSocket para alertas XDR en tiempo real."""

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError

from app.core.security import decode_token

router = APIRouter(tags=["XDR WebSocket"])


class ConnectionManager:
    """Gestiona conexiones WebSocket activas por organización."""

    def __init__(self) -> None:
        # org_id -> set de websockets
        self._connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, org_id: str) -> None:
        await websocket.accept()
        if org_id not in self._connections:
            self._connections[org_id] = set()
        self._connections[org_id].add(websocket)

    def disconnect(self, websocket: WebSocket, org_id: str) -> None:
        if org_id in self._connections:
            self._connections[org_id].discard(websocket)
            if not self._connections[org_id]:
                del self._connections[org_id]

    async def broadcast_to_org(self, org_id: str, message: dict) -> None:
        """Envía un mensaje a todas las conexiones de una organización."""
        if org_id not in self._connections:
            return
        dead: Set[WebSocket] = set()
        for ws in self._connections[org_id]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.disconnect(ws, org_id)

    def active_connections_count(self, org_id: str) -> int:
        return len(self._connections.get(org_id, set()))


# Instancia global del manager
manager = ConnectionManager()


@router.websocket("/ws/v1/alerts")
async def xdr_alerts_ws(websocket: WebSocket):
    """
    Stream WebSocket de alertas XDR en tiempo real.

    El cliente debe enviar el JWT como primer mensaje:
    { "type": "auth", "token": "<access_token>" }

    Luego recibe alertas del formato:
    {
        "type": "alert",
        "severity": "critical|high|medium|low",
        "title": "...",
        "source": "endpoint|network|identity",
        "asset_id": "...",
        "description": "...",
        "timestamp": "ISO8601"
    }
    """
    org_id: str | None = None

    try:
        # Esperar autenticación inicial
        await websocket.accept()
        auth_msg = await asyncio.wait_for(websocket.receive_text(), timeout=15.0)

        try:
            auth_data = json.loads(auth_msg)
        except json.JSONDecodeError:
            await websocket.send_json({"type": "error", "message": "Mensaje de auth inválido"})
            await websocket.close(code=1008)
            return

        if auth_data.get("type") != "auth" or not auth_data.get("token"):
            await websocket.send_json({"type": "error", "message": "Se requiere autenticación"})
            await websocket.close(code=1008)
            return

        # Validar JWT
        try:
            payload = decode_token(auth_data["token"])
            org_id = payload.get("org")
            if not org_id:
                raise ValueError("org no encontrada en token")
        except (JWTError, ValueError):
            await websocket.send_json({"type": "error", "message": "Token inválido"})
            await websocket.close(code=1008)
            return

        # Registrar conexión (ya fue aceptado arriba, solo registrar)
        if org_id not in manager._connections:
            manager._connections[org_id] = set()
        manager._connections[org_id].add(websocket)

        # Confirmar conexión
        await websocket.send_json({
            "type": "connected",
            "message": "Conectado al stream XDR",
            "org_id": org_id,
        })

        # Mantener la conexión viva con heartbeat
        while True:
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                data = json.loads(msg)
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except asyncio.TimeoutError:
                # Enviar heartbeat
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

    except WebSocketDisconnect:
        if org_id:
            manager.disconnect(websocket, org_id)
    except Exception:
        if org_id:
            manager.disconnect(websocket, org_id)
