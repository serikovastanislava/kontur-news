from django.contrib.auth.models import User
from django.db import models


class NewsItem(models.Model):
    CATEGORY_CHOICES = [
        ("Мир", "Мир"),
        ("Политика", "Политика"),
        ("Экономика", "Экономика"),
        ("Технологии", "Технологии"),
        ("Общество", "Общество"),
        ("Спорт", "Спорт"),
        ("Культура", "Культура"),
        ("Наука", "Наука"),
        ("Здоровье", "Здоровье"),
        ("Происшествия", "Происшествия"),
        ("Бизнес", "Бизнес"),
    ]

    title = models.CharField(max_length=500)
    url = models.URLField(unique=True)
    content = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    source = models.CharField(max_length=160, blank=True)
    author = models.CharField(max_length=160, blank=True, default="Редакция")
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default="Мир", db_index=True)
    image_url = models.URLField(blank=True, null=True)
    image_credit = models.CharField(max_length=200, blank=True)
    video_url = models.URLField(blank=True, null=True)
    video_type = models.CharField(max_length=24, blank=True, default="")
    video_credit = models.CharField(max_length=200, blank=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    views = models.PositiveIntegerField(default=0)
    importance_score = models.PositiveSmallIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "-created_at"]),
            models.Index(fields=["-importance_score", "-created_at"]),
        ]

    @property
    def is_important(self):
        return self.importance_score >= 60


class NewsView(models.Model):
    news_item = models.ForeignKey(NewsItem, on_delete=models.CASCADE, related_name="view_events")
    viewed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    visitor_key = models.CharField(max_length=64, blank=True, default="")

    class Meta:
        indexes = [models.Index(fields=["news_item", "-viewed_at"])]


class FavoriteNews(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    news_item = models.ForeignKey(NewsItem, on_delete=models.CASCADE, related_name="liked_by")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "news_item"], name="unique_user_favorite_news")
        ]

class DiscussionMessage(models.Model):
    news_item = models.ForeignKey(
        NewsItem,
        on_delete=models.CASCADE,
        related_name="discussion_messages",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="discussion_messages",
    )
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(
                fields=["news_item", "-created_at"],
                name="dm_news_created_idx",
            ),
        ]



