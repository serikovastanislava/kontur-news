import time

from django.core.management.base import BaseCommand

from news_app.parser import start_parsing


class Command(BaseCommand):
    help = "Fetch news from configured sources. Use --loop for continuous parsing."

    def add_arguments(self, parser):
        parser.add_argument("--loop", action="store_true")
        parser.add_argument("--interval", type=int, default=60)

    def handle(self, *args, **options):
        loop = options["loop"]
        interval = max(10, options["interval"])

        while True:
            added = start_parsing()
            self.stdout.write(self.style.SUCCESS(f"Parser finished: {added} new items"))
            if not loop:
                break
            time.sleep(interval)
