from django.contrib import admin
from .models import FavoriteNews, NewsItem, NewsView


@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "source", "importance_score", "views", "published_at")
    list_filter = ("category", "source")
    search_fields = ("title", "content", "source")
    ordering = ("-created_at",)
    readonly_fields = ("views", "created_at", "updated_at")


@admin.register(FavoriteNews)
class FavoriteNewsAdmin(admin.ModelAdmin):
    list_display = ("user", "news_item", "added_at")
    search_fields = ("user__email", "news_item__title")


@admin.register(NewsView)
class NewsViewAdmin(admin.ModelAdmin):
    list_display = ("news_item", "viewed_at", "visitor_key")
    search_fields = ("news_item__title", "visitor_key")
    readonly_fields = ("news_item", "viewed_at", "visitor_key")
