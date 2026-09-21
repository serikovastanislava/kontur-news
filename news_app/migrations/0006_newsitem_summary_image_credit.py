from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("news_app", "0005_newsitem_source_author_length")]

    operations = [
        migrations.AddField(
            model_name="newsitem",
            name="summary",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="newsitem",
            name="image_credit",
            field=models.CharField(blank=True, max_length=200),
        ),
    ]
