from rest_framework import serializers
from .models import NewsItem

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsItem
        fields = ['id', 'title', 'url', 'content', 'image_url', 'source', 'author', 'created_at']