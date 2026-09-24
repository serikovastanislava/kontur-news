from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("news_app", "0012_newsitem_video"),
    ]

    operations = [
        migrations.AlterField(
            model_name="newsitem",
            name="video_credit",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
    ]
