import os
import threading
import time
from django.apps import AppConfig


class NewsAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "news_app"

    def ready(self):
        # Проверка RUN_MAIN предотвращает двойной запуск при работе Django reloader
        if os.environ.get("RUN_MAIN") == "true":
            thread = threading.Thread(target=self.start_auto_parser, daemon=True)
            thread.start()

    def start_auto_parser(self):
        time.sleep(3)  # Небольшая пауза для полной инициализации БД
        print("[AUTOPARSER] Фоновый автопарсер успешно запущен (интервал: 30 сек)")

        from news_app.parser import start_telegram_web_parsing

        try:
            from news_app.parser import start_parsing
        except ImportError:
            start_parsing = None

        while True:
            # 1. Запуск RSS
            if start_parsing:
                try:
                    start_parsing()
                except Exception as e:
                    print(f"[AUTOPARSER RSS ERROR] {e}")

            # 2. Запуск Telegram Web с загрузкой медиа
            try:
                start_telegram_web_parsing()
            except Exception as e:
                print(f"[AUTOPARSER TG ERROR] {e}")

            time.sleep(30)