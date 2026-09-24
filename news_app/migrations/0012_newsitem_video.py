from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news_app", "0011_remove_newsitem_image_source_url_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="newsitem",
            name="video_url",
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="newsitem",
            name="video_type",
            field=models.CharField(blank=True, default="", max_length=24),
        ),
        migrations.AddField(
            model_name="newsitem",
            name="video_credit",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
    ]
