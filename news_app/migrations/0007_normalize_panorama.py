import re

from django.db import migrations


RATING_RE = re.compile(r"\bрейтинг\s*:\s*\d+(?:[.,]\d+)?\s*[—–-]?\s*", re.I)


def normalize(apps, schema_editor):
    NewsItem = apps.get_model("news_app", "NewsItem")
    qs = NewsItem.objects.filter(source__icontains="Панорама")
    for item in qs.iterator():
        item.source = "ИА «Панорама»"
        item.title = re.sub(RATING_RE, "", item.title).strip()
        item.save(update_fields=["source", "title"])


def reverse(apps, schema_editor):
    # Do not restore the removed label; normalization is intentionally one-way.
    pass


class Migration(migrations.Migration):
    dependencies = [("news_app", "0006_newsitem_summary_image_credit")]

    operations = [migrations.RunPython(normalize, reverse)]
