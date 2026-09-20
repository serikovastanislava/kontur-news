from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import FavoriteNews, NewsItem


class NewsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.news = NewsItem.objects.create(
            title="Тестовая новость",
            url="https://example.com/test-news",
            source="Тест",
        )

    def test_news_feed_is_public(self):
        response = self.client.get("/api/news/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["title"], "Тестовая новость")

    def test_register_login_and_favorite(self):
        response = self.client.post("/api/auth/register/", {
            "name": "Тестовый пользователь",
            "email": "test@example.com",
            "password": "secret123",
        }, format="json")
        self.assertEqual(response.status_code, 201)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['tokens']['access']}")
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["email"], "test@example.com")

        liked = self.client.post(f"/api/news/{self.news.id}/like/")
        self.assertEqual(liked.status_code, 201)
        self.assertTrue(liked.data["liked"])
        self.assertTrue(FavoriteNews.objects.filter(user__email="test@example.com", news_item=self.news).exists())

        favorites = self.client.get("/api/news/favorites/")
        self.assertEqual(favorites.data["ids"], [self.news.id])
