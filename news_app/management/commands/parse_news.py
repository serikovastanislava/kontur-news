import time
from django.core.management.base import BaseCommand

# Импортируем базовый RSS парсер
try:
    from news_app.parser import start_parsing
except ImportError:
    start_parsing = None

# Импортируем ВЕБ-парсер Telegram
try:
    from news_app.parser import start_telegram_web_parsing, repair_existing_images
except ImportError:
    start_telegram_web_parsing = None
    repair_existing_images = None


class Command(BaseCommand):
    help = "Запуск парсинга новостей (RSS и Telegram Web)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--loop",
            action="store_true",
            help="Запускать парсинг в бесконечном цикле",
        )
        parser.add_argument(
            "--interval",
            type=int,
            default=30,
            help="Интервал в секундах между запусками",
        )
        parser.add_argument(
            "--seed-topic-stubs",
            type=int,
            default=0,
            metavar="N",
            help="Создать до N открытых заглушек на каждую категорию.",
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
        interval = options["interval"]
        repair_limit = options["repair_images"]
        stub_count = options["seed_topic_stubs"]

        if stub_count:
            try:
                from news_app.management.commands.seed_topic_stubs import Command as SeedTopicStubs
                self.stdout.write(self.style.SUCCESS(f"--- Заглушки тем: {stub_count} на категорию ---"))
                SeedTopicStubs().handle(count=stub_count, force=False)
            except Exception as e:
                self.stderr.write(f"[STUB ERROR] {e}")

        if repair_limit and repair_existing_images:
            self.stdout.write(self.style.SUCCESS(
                f"--- Восстановление изображений (до {repair_limit}) ---"
            ))
            try:
                repair_existing_images(repair_limit)
            except Exception as e:
                self.stderr.write(f"[IMAGE REPAIR ERROR] {e}")

        if loop:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Запуск парсера в цикле (интервал: {interval} сек)..."
                )
            )
            while True:
                self.run_parsers()
                time.sleep(interval)
        else:
            self.run_parsers()

    def run_parsers(self):
        # 1. RSS / HTML
        if start_parsing:
            self.stdout.write("--- Запуск RSS парсера ---")
            try:
                start_parsing()
            except Exception as e:
                self.stderr.write(f"[RSS ERROR] {e}")

        # 2. Telegram Web
        if start_telegram_web_parsing:
            self.stdout.write("--- Запуск Telegram Web парсера ---")
            try:
                start_telegram_web_parsing()
            except Exception as e:
                self.stderr.write(f"[TG WEB ERROR] {e}")