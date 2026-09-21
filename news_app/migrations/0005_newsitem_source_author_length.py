from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("news_app", "0004_newsitem_categories_views")]

    operations = [
        migrations.AlterField(
            model_name="newsitem",
            name="source",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AlterField(
            model_name="newsitem",
            name="author",
            field=models.CharField(blank=True, default="Редакция", max_length=160),
        ),
    ]
