import hashlib
from datetime import timedelta
from xml.etree import ElementTree as ET

import requests
from django.core.cache import cache
from django.db import transaction, models
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import FavoriteNews, NewsItem, NewsView
from .serializers import NewsSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def get_news_feed(request):
    try:
        limit = min(max(int(request.query_params.get("limit", 100)), 1), 100)
    except (TypeError, ValueError):
        limit = 100

    category = (request.query_params.get("category") or "").strip()
    query = (request.query_params.get("q") or "").strip()

    base = NewsItem.objects.all()
    if category and category != "Все":
        base = base.filter(category__iexact=category)

    if query:
        base = base.filter(
            models.Q(title__icontains=query)
            | models.Q(summary__icontains=query)
            | models.Q(content__icontains=query)
            | models.Q(source__icontains=query)
            | models.Q(category__icontains=query)
        )

    # For the main feed Panorama occupies every 20th position. Category/search
    # requests stay pure: users should see all matching articles, not a mixed feed.
    if not category and not query:
        panorama_slots = max(0, limit // 20)
        normal_limit = limit - panorama_slots
        normal = list(
            base.exclude(source__icontains="Панорама")
            .order_by("-published_at", "-created_at")[:normal_limit]
        )
        panorama = list(
            base.filter(source__icontains="Панорама")
            .order_by("-published_at", "-created_at")[:panorama_slots]
        )
        result = []
        normal_i = panorama_i = 0
        for position in range(1, limit + 1):
            if position % 20 == 0 and panorama_i < len(panorama):
                result.append(panorama[panorama_i]); panorama_i += 1
            elif normal_i < len(normal):
                result.append(normal[normal_i]); normal_i += 1
            elif panorama_i < len(panorama):
                result.append(panorama[panorama_i]); panorama_i += 1
            else:
                break
    else:
        result = list(base.order_by("-published_at", "-created_at")[:limit])

    return Response(NewsSerializer(result, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_featured_news(request):
    """One hero story selected by transparent engagement/freshness signals.

    We do not invent external portal counters. The score uses Kontur's own
    view events, article importance signals and freshness, so the banner is
    stable and explainable.
    """
    since = timezone.now() - timedelta(days=7)
    candidates = list(
        NewsItem.objects.exclude(source__icontains="Панорама")
        .annotate(
            weekly_views=Count(
                "view_events",
                filter=Q(view_events__viewed_at__gte=since),
            )
        )
        .order_by("-published_at", "-created_at")[:80]
    )

    if not candidates:
        return Response({})

    now = timezone.now()
    max_views = max((item.weekly_views for item in candidates), default=0) or 1

    def score(item):
        published = item.published_at or item.created_at
        age_hours = max(0.0, (now - published).total_seconds() / 3600)
        freshness = max(0.0, 1.0 - age_hours / (72.0 * 1.0))
        engagement = min(1.0, item.weekly_views / max_views)
        editorial = min(1.0, item.importance_score / 100.0)
        # Explicit, reproducible weights: freshness 45%, content signals 35%,
        # audience engagement 20%.
        return freshness * 45 + editorial * 35 + engagement * 20

    item = max(candidates, key=score)
    data = NewsSerializer(item).data
    data["weekly_views"] = item.weekly_views
    data["selection_score"] = round(score(item), 2)
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_important_news(request):
    try:
        limit = min(max(int(request.query_params.get("limit", 12)), 1), 50)
    except (TypeError, ValueError):
        limit = 12

    since = timezone.now() - timedelta(days=7)
    items = list(
        NewsItem.objects.exclude(source__icontains="Панорама")
        .annotate(
            weekly_views=Count(
                "view_events",
                filter=Q(view_events__viewed_at__gte=since),
            )
        )
        .order_by("-importance_score", "-published_at", "-created_at")[:limit]
    )

    return Response(NewsSerializer(items, many=True).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    # Compatibility alias is intentionally not used; registration belongs in users_app.
    return Response({"detail": "Use /api/auth/register/"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def record_view(request, news_id):
    news_item = NewsItem.objects.filter(pk=news_id).first()
    if not news_item:
        return Response({"detail": "Новость не найдена"}, status=status.HTTP_404_NOT_FOUND)

    user = getattr(request, "user", None)
    identity = str(user.pk) if user and user.is_authenticated else (request.META.get("HTTP_X_REAL_IP") or request.META.get("REMOTE_ADDR", "")) + request.META.get("HTTP_USER_AGENT", "")
    visitor_key = hashlib.sha256(identity.encode("utf-8")).hexdigest()[:64]
    recent = NewsView.objects.filter(
        news_item=news_item,
        visitor_key=visitor_key,
        viewed_at__gte=timezone.now() - timedelta(minutes=30),
    ).exists()
    if not recent:
        with transaction.atomic():
            NewsView.objects.create(news_item=news_item, visitor_key=visitor_key)
            NewsItem.objects.filter(pk=news_item.pk).update(views=models.F("views") + 1)
    weekly_views = NewsView.objects.filter(
        news_item=news_item,
        viewed_at__gte=timezone.now() - timedelta(days=7),
    ).count()
    news_item.refresh_from_db(fields=["views"])
    return Response({"views": news_item.views, "weekly_views": weekly_views})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_favorites(request):
    ids = FavoriteNews.objects.filter(user=request.user).values_list("news_item_id", flat=True)
    return Response({"ids": list(ids)})


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def toggle_like(request, news_id):
    news_item = NewsItem.objects.filter(pk=news_id).first()
    if not news_item:
        return Response({"detail": "Новость не найдена"}, status=status.HTTP_404_NOT_FOUND)
    favorite = FavoriteNews.objects.filter(user=request.user, news_item=news_item).first()
    if request.method == "DELETE" or favorite:
        if favorite:
            favorite.delete()
        return Response({"liked": False})
    FavoriteNews.objects.create(user=request.user, news_item=news_item)
    return Response({"liked": True}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def currency_rates(request):
    cached = cache.get("cbr_currency_rates")
    if cached:
        return Response(cached)
    url = "https://www.cbr.ru/scripts/XML_daily.asp"
    try:
        response = requests.get(url, timeout=8, headers={"User-Agent": "Kontur/1.0"})
        response.raise_for_status()
        root = ET.fromstring(response.content)
        wanted = {"USD", "EUR", "CNY", "GBP", "JPY"}
        rates = []
        for item in root.findall("Valute"):
            code = item.findtext("CharCode", "")
            if code not in wanted:
                continue
            nominal = float(item.findtext("Nominal", "1").replace(",", "."))
            value = float(item.findtext("Value", "0").replace(",", ".")) / nominal
            rates.append({"code": code, "value": round(value, 4), "nominal": 1})
        payload = {"date": root.attrib.get("Date"), "base": "RUB", "rates": rates, "updated_at": timezone.now()}
        cache.set("cbr_currency_rates", payload, 15 * 60)
        return Response(payload)
    except Exception as exc:
        return Response({"detail": "Не удалось получить курсы ЦБ РФ", "error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
