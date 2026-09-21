from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from news_app.views import currency_rates, get_favorites, get_featured_news, get_important_news, get_news_feed, record_view, toggle_like
from users_app.views import login, me, register

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", login, name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", register, name="register"),
    path("api/auth/me/", me, name="me"),
    path("api/news/", get_news_feed, name="news-feed"),
    path("api/news/featured/", get_featured_news, name="featured-news"),
    path("api/news/important/", get_important_news, name="important-news"),
    path("api/news/currency/", currency_rates, name="currency-rates"),
    path("api/news/<int:news_id>/view/", record_view, name="record-view"),
    path("api/news/favorites/", get_favorites, name="favorites"),
    path("api/news/<int:news_id>/like/", toggle_like, name="toggle-like"),
]
