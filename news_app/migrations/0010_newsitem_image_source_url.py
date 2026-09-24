from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("news_app", "0009_alter_newsitem_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="newsitem",
            name="image_source_url",
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
