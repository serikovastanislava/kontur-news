from rest_framework import serializers
from .models import NewsItem


def shorten_headline(value, max_length=92):
    text = " ".join(str(value or "").split())
    if len(text) <= max_length:
        return text
    cut = text[:max_length + 1].rsplit(" ", 1)[0].rstrip(" ,:;—–-\"")
    return (cut or text[:max_length]).rstrip() + "…"


class NewsSerializer(serializers.ModelSerializer):
    editorial = serializers.CharField(source="source", read_only=True)
    is_important = serializers.BooleanField(read_only=True)
    short_title = serializers.SerializerMethodField()

    def get_short_title(self, obj):
        return shorten_headline(obj.title)

    class Meta:
        model = NewsItem
        fields = [
            "id", "title", "short_title", "url", "content", "summary",
            "image_url", "image_credit", "source", "editorial", "author",
            "category", "created_at", "published_at", "views",
            "importance_score", "is_important",
        ]
