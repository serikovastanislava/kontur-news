from rest_framework import serializers
from .models import NewsItem


class NewsItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsItem
        fields = "__all__"

    def get_image_url(self, obj):
        if not obj.image_url:
            return None
        # Local media is deliberately same-origin. The frontend nginx serves
        # /media/ from the shared media volume, so there is no localhost:8000
        # or CORS dependency in the browser.
        if obj.image_url.startswith("/media/"):
            return obj.image_url
        if obj.image_url.startswith(("http://", "https://")):
            return obj.image_url
        return f"/{obj.image_url.lstrip('/')}"


NewsSerializer = NewsItemSerializer
