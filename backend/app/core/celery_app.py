"""Configuración de la aplicación Celery."""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "cybersec_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.services.scanner.scan_tasks",
        "app.services.reports.report_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Guatemala",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,
    beat_schedule={
        # Escaneo automático diario a las 02:00 Guatemala
        "scheduled-daily-scans": {
            "task": "app.services.scanner.scan_tasks.run_scheduled_scans",
            "schedule": 86400.0,
        },
    },
)
