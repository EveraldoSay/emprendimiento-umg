"""Cliente para el LLM local via Ollama. Nunca envía datos a APIs externas."""

import json
from typing import Any

import httpx

from app.core.config import settings


class OllamaService:
    """
    Interactúa con Ollama sobre HTTP local.
    URL base: http://ollama:11434 (contenedor Docker).
    """

    def __init__(self) -> None:
        self._base_url = settings.OLLAMA_BASE_URL
        self._model = settings.OLLAMA_DEFAULT_MODEL
        self._timeout = settings.OLLAMA_TIMEOUT_SECONDS

    async def generate(
        self,
        prompt: str,
        model: str | None = None,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> dict[str, Any]:
        """
        Envía un prompt al LLM local y retorna la respuesta.

        Args:
            prompt: Mensaje del usuario.
            model: Modelo a usar (por defecto: settings.OLLAMA_DEFAULT_MODEL).
            system_prompt: Instrucción de sistema opcional.
            temperature: Creatividad del modelo (0=determinístico, 1=creativo).

        Returns:
            dict con keys: response, model, prompt_eval_count, eval_count
        """
        payload: dict[str, Any] = {
            "model": model or self._model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": 2048,
            },
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                f"{self._base_url}/api/generate",
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def list_models(self) -> list[str]:
        """Retorna los modelos disponibles en el servidor Ollama local."""
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{self._base_url}/api/tags")
            response.raise_for_status()
            data = response.json()
            return [m["name"] for m in data.get("models", [])]

    async def health_check(self) -> bool:
        """Verifica que Ollama esté disponible."""
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(f"{self._base_url}/api/tags")
                return r.status_code == 200
        except Exception:
            return False
