from django.core.management.base import BaseCommand

from news_app.models import NewsItem


OLD_SOURCES = (
    "РИА Новости",
    "Российская Газета",
    "БНК Коми",
)


class Command(BaseCommand):
    help = "Remove news from sources that were replaced in the current Kontur configuration."

    def add_arguments(self, parser):
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Confirm deletion.",
        )

    def handle(self, *args, **options):
        qs = NewsItem.objects.filter(source__in=OLD_SOURCES)
        count = qs.count()

        if not options["yes"]:
            self.stdout.write(
                f"Будет удалено материалов: {count}. "
                "Для подтверждения запустите: python manage.py remove_old_sources --yes"
            )
            return

        deleted, _ = qs.delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"Удалено материалов старых источников: {deleted}"
            )
        )
