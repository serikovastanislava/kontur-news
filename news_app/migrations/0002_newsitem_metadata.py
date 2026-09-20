from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("news_app", "0001_initial")]

    operations = [
        migrations.AddField("newsitem", "source", models.CharField(blank=True, max_length=120)),
        migrations.AddField("newsitem", "author", models.CharField(blank=True, default="Редакция", max_length=120)),
        migrations.AddField("newsitem", "image_url", models.URLField(blank=True, null=True)),
    ]
