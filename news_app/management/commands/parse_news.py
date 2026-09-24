import time

from django.core.management.base import BaseCommand

from news_app.parser import repair_existing_images, start_telegram_web_parsing


class Command(BaseCommand):
    help = "Запуск Telegram Web парсера"

    def add_arguments(self, parser):
        parser.add_argument(
            "--loop",
            action="store_true",
            help="Запускать Telegram-парсер в бесконечном цикле",
        )
        parser.add_argument(
            "--interval",
            type=int,
            default=60,
            help="Интервал в секундах между проходами (по умолчанию 60 секунд)",
        )
        parser.add_argument(
            "--repair-images",
            type=int,
            default=200,
            metavar="N",
            help="При старте восстановить до N старых/битых изображений (0 = отключить).",
        )

    def handle(self, *args, **options):
        loop = options["loop"]
        interval = max(1, options["interval"])
        repair_limit = options["repair_images"]

        if repair_limit:
            self.stdout.write(
                self.style.SUCCESS(
                    f"--- Восстановление изображений (до {repair_limit}) ---"
                )
            )
            try:
                repair_existing_images(repair_limit)
            except Exception as exc:
                self.stderr.write(f"[IMAGE REPAIR ERROR] {exc}")

        if loop:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Запуск Telegram-парсера: новый проход каждые {interval} сек."
                )
            )
            while True:
                started_at = time.monotonic()
                self.run_parser()
                elapsed = time.monotonic() - started_at
                time.sleep(max(0, interval - elapsed))
        else:
            self.run_parser()

    def run_parser(self):
        self.stdout.write("--- Запуск Telegram Web парсера ---")
        try:
            added = start_telegram_web_parsing()
            self.stdout.write(
                self.style.SUCCESS(f"Добавлено из Telegram: {added}")
            )
        except Exception as exc:
            self.stderr.write(f"[TG WEB ERROR] {exc}")
