from django.core.management.base import BaseCommand

from news_app.models import NewsItem
from news_app.parser import extract_article_page, find_free_image, make_summary


class Command(BaseCommand):
    help = "Fetch full article text, author, dates and free covers for existing news."

    def handle(self, *args, **options):
        changed = 0
        for item in NewsItem.objects.all().iterator():
            content, author, published_at = extract_article_page(
                item.url,
                item.source,
                item.author or "Редакция",
            )
            update_fields = []
            if content and len(content) > len(item.content or ""):
                item.content = content
                update_fields.append("content")
            if author and author != item.author:
                item.author = author[:160]
                update_fields.append("author")
            if published_at and not item.published_at:
                item.published_at = published_at
                update_fields.append("published_at")
            if item.content:
                item.summary = make_summary(item.content, item.title)
                update_fields.append("summary")
            if not item.image_url:
                picked = find_free_image(item.title, item.category)
                if picked.get("url"):
                    item.image_url = picked["url"]
                    item.image_credit = picked.get("credit", "")
                    update_fields += ["image_url", "image_credit"]
            if update_fields:
                item.save(update_fields=sorted(set(update_fields)))
                changed += 1
        self.stdout.write(self.style.SUCCESS(f"Обновлено материалов: {changed}"))
