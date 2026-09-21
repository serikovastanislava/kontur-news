import os
import sys

from django.apps import AppConfig


class NewsAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "news_app"

    def ready(self):
        # Production Docker uses a dedicated parser service. Gunicorn workers
        # must never each create their own scheduler.
        if "parse_news" in sys.argv or "gunicorn" in " ".join(sys.argv):
            return

        # Only the Django runserver autoreload child starts the local scheduler.
        if "runserver" not in sys.argv:
            return
        if os.environ.get("RUN_MAIN") != "true":
            return

        try:
            from .scheduler import start_scheduler
            start_scheduler()
        except Exception as exc:
            print(f"[SCHEDULER] Не удалось запустить планировщик: {exc}")
