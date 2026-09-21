from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import NewsItem


class NewsApiTests(APITestCase):
    def setUp(self):
        self.news = NewsItem.objects.create(
            title="Важная новость о новых технологиях",
            url="https://example.com/news/1",
            content="Исследователи сообщили о новом проекте.",
            source="Тестовая редакция",
            category="Технологии",
            importance_score=70,
        )

    def test_feed_contains_category_and_editorial(self):
        response = self.client.get(reverse("news-feed"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["category"], "Технологии")
        self.assertEqual(response.data[0]["editorial"], "Тестовая редакция")

    def test_view_endpoint_counts_weekly_view(self):
        response = self.client.post(reverse("record-view", args=[self.news.id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["weekly_views"], 1)

    def test_registration_and_login(self):
        response = self.client.post(reverse("register"), {
            "name": "Тестовый пользователь",
            "email": "test@example.com",
            "password": "StrongPass123!",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="test@example.com").exists())
        login = self.client.post(reverse("login"), {
            "email": "test@example.com",
            "password": "StrongPass123!",
        }, format="json")
        self.assertEqual(login.status_code, 200)
        self.assertIn("access", login.data["tokens"])
