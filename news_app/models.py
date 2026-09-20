from django.db import models
from django.contrib.auth.models import User


class NewsItem(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField(unique=True)
    content = models.TextField(blank=True)
    source = models.CharField(max_length=120, blank=True)
    author = models.CharField(max_length=120, blank=True, default="Редакция")
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class FavoriteNews(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    news_item = models.ForeignKey(NewsItem, on_delete=models.CASCADE, related_name='liked_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "news_item")
