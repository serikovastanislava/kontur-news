from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import FavoriteNews, NewsItem
from .serializers import NewsSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def get_news_feed(request):
    normal_news = list(
        NewsItem.objects.exclude(source__icontains="Панорама").order_by("-created_at")[:100]
    )
    panorama_news = list(
        NewsItem.objects.filter(source__icontains="Панорама").order_by("-created_at")[:10]
    )

    result = []
    normal_index = panorama_index = 0
    position = 1

    while normal_index < len(normal_news) or panorama_index < len(panorama_news):
        if position % 20 == 0 and panorama_index < len(panorama_news):
            result.append(panorama_news[panorama_index])
            panorama_index += 1
        elif normal_index < len(normal_news):
            result.append(normal_news[normal_index])
            normal_index += 1
        elif panorama_index < len(panorama_news):
            result.append(panorama_news[panorama_index])
            panorama_index += 1

        position += 1
        if len(result) >= 100:
            break

    return Response(NewsSerializer(result, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_favorites(request):
    ids = FavoriteNews.objects.filter(user=request.user).values_list("news_item_id", flat=True)
    return Response({"ids": list(ids)})


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def toggle_like(request, news_id):
    news_item = get_object_or_404(NewsItem, pk=news_id)
    favorite = FavoriteNews.objects.filter(user=request.user, news_item=news_item).first()

    if request.method == "DELETE" or favorite:
        if favorite:
            favorite.delete()
        return Response({"liked": False}, status=status.HTTP_200_OK)

    FavoriteNews.objects.create(user=request.user, news_item=news_item)
    return Response({"liked": True}, status=status.HTTP_201_CREATED)
