import os
from django.conf import settings
from django.core.management.base import BaseCommand

from news_app.models import NewsItem
from news_app.parser import (
    extract_article_metadata,
    resolve_article_image,
)


class Command(BaseCommand):
    help = "Find, download and normalize article images. Images are stored locally."

    def add_arguments(self, parser):
        parser.add_argument(
            "--all",
            action="store_true",
            help="Re-resolve images for every article, including articles that already have one.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Process only N newest articles (0 = all).",
        )

    def handle(self, *args, **options):
        qs = NewsItem.objects.all().order_by("-created_at")
        if options["limit"]:
            qs = qs[: options["limit"]]

        changed = 0
        checked = 0

        for item in qs.iterator():
            checked += 1
            current = item.image_url or ""

            # A local URL is safe only when the file is actually present in the
            # shared media volume. Old deployments often had the URL in DB but
            # the file lived in a short-lived parser container.
            if current.startswith("/media/") and not options["all"]:
                local_path = os.path.join(settings.MEDIA_ROOT, current[len("/media/"):])
                if os.path.isfile(local_path) and os.path.getsize(local_path) > 1500:
                    continue

            metadata = extract_article_metadata(
                item.url,
                item.source or "Источник",
                item.author or "Редакция",
            )
            source_image = metadata.get("image_url") or (
                current if current.startswith(("http://", "https://")) else ""
            )
            content = metadata.get("excerpt") or item.summary or item.content or ""

            prefix = f"refresh_{item.pk}"
            local_image, credit = resolve_article_image(
                image_url=source_image,
                title=metadata.get("title") or item.title,
                content=content,
                category=item.category,
                filename_prefix=prefix,
                source_url=item.url,
            )

            if not local_image:
                continue

            update_fields = []
            if local_image != item.image_url:
                item.image_url = local_image
                update_fields.append("image_url")
            if credit and credit != item.image_credit:
                item.image_credit = credit
                update_fields.append("image_credit")

            if metadata.get("title") and len(metadata["title"]) >= 15 and metadata["title"] != item.title:
                item.title = metadata["title"][:500]
                update_fields.append("title")

            if metadata.get("author") and metadata["author"] != item.author:
                item.author = metadata["author"][:160]
                update_fields.append("author")

            if metadata.get("published_at") and not item.published_at:
                item.published_at = metadata["published_at"]
                update_fields.append("published_at")

            if update_fields:
                item.save(update_fields=sorted(set(update_fields + ["updated_at"])))
                changed += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Проверено: {checked}; обновлено изображений/метаданных: {changed}"
            )
        )
