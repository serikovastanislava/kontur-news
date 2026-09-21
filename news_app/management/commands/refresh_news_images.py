from django.core.management.base import BaseCommand
from news_app.models import NewsItem
from news_app.parser import find_free_image, extract_media_from_html


class Command(BaseCommand):
    help = "Заменяет повторяющиеся/отсутствующие изображения новостей на разные свободные изображения."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=100, help="Сколько новостей обработать")
        parser.add_argument("--all", action="store_true", help="Обработать все новости")

    def handle(self, *args, **options):
        qs = NewsItem.objects.order_by("-published_at", "-created_at")
        if not options["all"]:
            qs = qs[: max(1, options["limit"])]

        used = set()
        changed = 0
        for item in qs:
            picked = find_free_image(item.title, item.category, used)
            url = picked.get("url") or ""
            if not url:
                fallback = extract_media_from_html(item.url)
                if fallback and fallback not in used:
                    url = fallback

            if not url or url in used:
                # Let the frontend generate its unique topical fallback instead of
                # assigning the same source image to several articles.
                if item.image_url is not None:
                    item.image_url = None
                    item.image_credit = ""
                    item.save(update_fields=["image_url", "image_credit", "updated_at"])
                    changed += 1
                continue

            if item.image_url != url or item.image_credit != picked.get("credit", ""):
                item.image_url = url
                item.image_credit = picked.get("credit", "")
                item.save(update_fields=["image_url", "image_credit", "updated_at"])
                changed += 1
            used.add(url)

        self.stdout.write(self.style.SUCCESS(f"Изображения обновлены: {changed}"))
