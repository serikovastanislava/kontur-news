from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from news_app.views import get_news_feed, toggle_like, get_favorites
from users_app.views import register, me

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", register, name="register"),
    path("api/auth/me/", me, name="me"),
    path("api/news/", get_news_feed, name="news-feed"),
    path("api/news/favorites/", get_favorites, name="favorites"),
    path("api/news/<int:news_id>/like/", toggle_like, name="toggle-like"),
]
