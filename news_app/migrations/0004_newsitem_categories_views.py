import django.db.models.deletion
from django.db import migrations, models


def backfill_categories(apps, schema_editor):
    NewsItem = apps.get_model("news_app", "NewsItem")
    from news_app.category import classify_news
    for item in NewsItem.objects.all().iterator():
        category, importance = classify_news(item.title, item.content)
        item.category = category
        item.importance_score = importance
        item.save(update_fields=["category", "importance_score"])



class Migration(migrations.Migration):
    dependencies = [("news_app", "0003_newsitem_title_length")]

    operations = [
        migrations.AddField(
            model_name="newsitem", name="category",
            field=models.CharField(choices=[("Мир", "Мир"), ("Политика", "Политика"), ("Экономика", "Экономика"), ("Технологии", "Технологии"), ("Общество", "Общество"), ("Спорт", "Спорт"), ("Культура", "Культура"), ("Наука", "Наука"), ("Здоровье", "Здоровье"), ("Происшествия", "Происшествия"), ("Бизнес", "Бизнес")], db_index=True, default="Мир", max_length=40),
        ),
        migrations.AddField(model_name="newsitem", name="importance_score", field=models.PositiveSmallIntegerField(db_index=True, default=0)),
        migrations.AddField(model_name="newsitem", name="published_at", field=models.DateTimeField(blank=True, db_index=True, null=True)),
        migrations.AddField(model_name="newsitem", name="updated_at", field=models.DateTimeField(auto_now=True)),
        migrations.AddField(model_name="newsitem", name="views", field=models.PositiveIntegerField(default=0)),
        migrations.RunPython(backfill_categories, migrations.RunPython.noop),
        migrations.CreateModel(
            name="NewsView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("viewed_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("visitor_key", models.CharField(blank=True, default="", max_length=64)),
                ("news_item", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="view_events", to="news_app.newsitem")),
            ],
        ),
        migrations.AddIndex(model_name="newsitem", index=models.Index(fields=["category", "-created_at"], name="news_app_ne_categor_1d2a0a_idx")),
        migrations.AddIndex(model_name="newsitem", index=models.Index(fields=["-importance_score", "-created_at"], name="news_app_ne_importa_ef8a3a_idx")),
        migrations.AddIndex(model_name="newsview", index=models.Index(fields=["news_item", "-viewed_at"], name="news_app_ne_news_it_8d6b0b_idx")),
        migrations.AlterUniqueTogether(name="favoritenews", unique_together=set()),
        migrations.AddConstraint(
            model_name="favoritenews",
            constraint=models.UniqueConstraint(fields=("user", "news_item"), name="unique_user_favorite_news"),
        ),
    ]
