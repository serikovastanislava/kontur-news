from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("news_app", "0002_newsitem_metadata")]

    operations = [
        migrations.AlterField(
            model_name="newsitem",
            name="title",
            field=models.CharField(max_length=500),
        ),
    ]
