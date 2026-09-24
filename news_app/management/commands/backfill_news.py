from django.core.management.base import BaseCommand

from news_app.models import NewsItem
from news_app.parser import extract_article_metadata, make_excerpt


class Command(BaseCommand):
    help = "Refresh source metadata, short excerpts and source image URLs for existing news."

    def handle(self, *args, **options):
        changed = 0

        for item in NewsItem.objects.all().iterator():
            metadata = extract_article_metadata(
                item.url,
                item.source or "Источник",
                item.author or "Редакция",
            )

            update_fields = []

            if metadata.get("title") and len(metadata["title"]) >= 15:
                if metadata["title"] != item.title:
                    item.title = metadata["title"][:500]
                    update_fields.append("title")

            excerpt = metadata.get("excerpt") or item.summary or item.content
            excerpt = make_excerpt(excerpt, item.title)
            if excerpt != item.summary:
                item.summary = excerpt
                item.content = excerpt
                update_fields.extend(["summary", "content"])

            author = metadata.get("author") or item.author
            if author and author != item.author:
                item.author = author[:160]
                update_fields.append("author")

            if metadata.get("published_at") and not item.published_at:
                item.published_at = metadata["published_at"]
                update_fields.append("published_at")

            if metadata.get("image_url") and not item.image_url:
                item.image_url = metadata["image_url"]
                item.image_credit = f"Источник: {item.source}" if item.source else ""
                update_fields.extend(["image_url", "image_credit"])

            if update_fields:
                item.save(update_fields=sorted(set(update_fields + ["updated_at"])))
                changed += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Обновлено материалов: {changed}"
            )
        )
