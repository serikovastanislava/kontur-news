from django.core.management.base import BaseCommand
from news_app.models import NewsItem
from news_app.parser import resolve_article_video, make_short_summary


class Command(BaseCommand):
    help = "Find real contextual videos for existing news items."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=0, help="Newest N items; 0 = all.")
        parser.add_argument("--force", action="store_true", help="Replace existing video URLs.")

    def handle(self, *args, **options):
        qs = NewsItem.objects.all().order_by("-published_at", "-created_at")
        if options["limit"]:
            qs = qs[:options["limit"]]

        checked = 0
        changed = 0
        for item in qs.iterator():
            checked += 1
            if item.video_url and not options["force"]:
                continue

            video_url, video_type, credit = resolve_article_video(
                item.title,
                item.summary or item.content or "",
                item.category,
                item.url,
            )
            if video_url:
                item.video_url = video_url
                item.video_type = video_type
                item.video_credit = credit
                item.summary = make_short_summary(item.content or item.title, item.title)
                item.save(update_fields=["video_url", "video_type", "video_credit", "summary", "updated_at"])
                changed += 1
                self.stdout.write(f"[VIDEO] {item.title[:80]}")

        self.stdout.write(self.style.SUCCESS(f"Проверено: {checked}; добавлено видео: {changed}"))
