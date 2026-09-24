from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("news_app", "0007_normalize_panorama"),
    ]

    operations = [
        migrations.AlterField(
            model_name="newsitem",
            name="image_url",
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
