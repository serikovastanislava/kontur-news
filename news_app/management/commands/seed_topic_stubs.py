import hashlib
import re
from datetime import timedelta

import requests
from django.core.management.base import BaseCommand
from django.utils import timezone

from news_app.models import NewsItem
from news_app.parser import download_and_process_image

OPENVERSE_API = "https://api.openverse.org/v1/images/"
UA = "KonturNews/3.0 topic-stubs/1.0"

TOPIC_QUERIES = {
    "Мир": "world international city people",
    "Политика": "politics parliament diplomacy government",
    "Экономика": "economy finance market business",
    "Технологии": "technology artificial intelligence computer innovation",
    "Общество": "society people community city everyday life",
    "Спорт": "sport athletes stadium competition",
    "Культура": "culture art museum theater books",
    "Наука": "science research laboratory space",
    "Здоровье": "health medicine hospital wellness",
    "Происшествия": "emergency rescue city safety",
    "Бизнес": "business office startup company meeting",
}

TITLE_BANK = {
    "Мир": [
        "Ключевые события дня: международная повестка",
        "Что меняется в отношениях между странами",
        "Новые международные инициативы и их контекст",
        "Главные темы мировой повестки этой недели",
        "Дипломатические контакты: что обсуждают стороны",
        "Международные события в коротком обзоре",
        "Как меняется глобальная экономическая повестка",
        "Региональные события, которые важно знать",
        "Мир сегодня: основные направления новостей",
        "Международные рынки и решения государств",
        "Новые сигналы из разных регионов мира",
        "Коротко о главных событиях за день",
    ],
    "Политика": [
        "Ключевые заявления и решения дня",
        "Политическая повестка: главные темы",
        "Что обсуждают представители власти",
        "Новые инициативы и общественная дискуссия",
        "Парламентская повестка в коротком обзоре",
        "Дипломатические контакты и официальные встречи",
        "Политические решения: контекст и детали",
        "Главные заявления недели",
        "Как меняется повестка общественных обсуждений",
        "Новые предложения и направления работы",
        "Политические события дня: кратко",
        "Что стоит знать о текущей повестке",
    ],
    "Экономика": [
        "Рынки и экономика: ключевые изменения",
        "Что происходит с деловой активностью",
        "Финансовая повестка дня",
        "Главные экономические темы недели",
        "Компании и рынки: короткий обзор",
        "Потребительский рынок: новые тенденции",
        "Инвестиционная повестка и новые проекты",
        "Экономические показатели: что изменилось",
        "Деньги и рынки: главное без лишнего",
        "Деловая активность и планы компаний",
        "Экономические решения и их контекст",
        "Коротко о главных событиях экономики",
    ],
    "Технологии": [
        "Новые технологии: что меняется прямо сейчас",
        "Искусственный интеллект и новые сценарии работы",
        "Цифровые сервисы: главные обновления",
        "Технологические разработки в коротком обзоре",
        "Как меняются привычные цифровые продукты",
        "Роботы и автоматизация: новые решения",
        "Связь и устройства: заметные новинки",
        "Кибербезопасность: основные тенденции",
        "Технологический рынок: что обсуждают",
        "Новые инструменты для работы и творчества",
        "Наука и технологии: точки пересечения",
        "Цифровая среда: главное за день",
    ],
    "Общество": [
        "Город и люди: важные изменения",
        "Социальная повестка в коротком обзоре",
        "Как меняется повседневная жизнь городов",
        "Образование и общество: главные темы",
        "Работа и занятость: новые тенденции",
        "Городские проекты и общественные инициативы",
        "Семья и общество: что обсуждают",
        "Социальные сервисы: новые подходы",
        "Жизнь регионов: короткий обзор",
        "Общественные инициативы и локальные проекты",
        "Главные темы общественной повестки",
        "Люди и города: события дня",
    ],
    "Спорт": [
        "Главные спортивные события дня",
        "Команды и спортсмены: последние новости",
        "Подготовка к соревнованиям: что известно",
        "Спортивный календарь: важные даты",
        "Результаты и события в мире спорта",
        "Новые рекорды и заметные выступления",
        "Большой спорт: короткий обзор",
        "Тренировки и подготовка спортсменов",
        "Спортивные площадки и новые проекты",
        "Главные матчи и соревнования недели",
        "Спорт и технологии: новые решения",
        "Коротко о спортивной повестке",
    ],
    "Культура": [
        "Главные события культурной сцены",
        "Выставки и музеи: что посмотреть",
        "Кино и сериалы: темы недели",
        "Книги и литература: новые имена",
        "Театр и сцена: заметные премьеры",
        "Музыка и фестивали: короткий обзор",
        "Современное искусство: новые проекты",
        "Культурные события городов",
        "Архитектура и дизайн: интересные идеи",
        "История и наследие: новые проекты",
        "Культура в цифровой среде",
        "Главное из культурной повестки",
    ],
    "Наука": [
        "Наука сегодня: главные направления исследований",
        "Новые исследования и научные проекты",
        "Космос и наблюдения: что обсуждают учёные",
        "Лаборатории и технологии будущего",
        "Научные открытия в коротком обзоре",
        "Исследования климата и окружающей среды",
        "Биология и медицина: новые вопросы",
        "Физика и материалы: новые разработки",
        "Наука и общество: важные темы",
        "Эксперименты и данные: что нового",
        "Научные проекты и международное сотрудничество",
        "Коротко о событиях научного мира",
    ],
    "Здоровье": [
        "Здоровье: главные темы дня",
        "Медицина и технологии: новые подходы",
        "Профилактика и здоровый образ жизни",
        "Исследования здоровья: что обсуждают",
        "Современная медицина в коротком обзоре",
        "Здравоохранение и новые сервисы",
        "Питание и самочувствие: актуальные вопросы",
        "Цифровые инструменты для здоровья",
        "Медицинские исследования и новые данные",
        "Здоровье общества: важные тенденции",
        "Как меняются медицинские технологии",
        "Главное из повестки здравоохранения",
    ],
    "Происшествия": [
        "Происшествия дня: короткий обзор",
        "Спасательные службы: важные события",
        "Безопасность города: что изменилось",
        "Экстренные службы и новые меры",
        "Дорожная безопасность: главные темы",
        "Погода и риски для инфраструктуры",
        "Как города готовятся к чрезвычайным ситуациям",
        "Безопасность общественных пространств",
        "Оперативная обстановка: кратко",
        "Спасатели и городские службы: новости",
        "Профилактика происшествий и новые решения",
        "Главное из оперативной повестки",
    ],
    "Бизнес": [
        "Бизнес сегодня: главные события",
        "Стартапы и новые проекты",
        "Компании и рынки: короткий обзор",
        "Предпринимательство: новые возможности",
        "Технологический бизнес: что обсуждают",
        "Новые продукты и бизнес-модели",
        "Корпоративные проекты и инвестиции",
        "Малый бизнес: актуальные тенденции",
        "Деловые сообщества и новые инициативы",
        "Рынок труда и компании",
        "Бизнес и цифровизация: новые решения",
        "Главное из деловой повестки",
    ],
}


def slug(value):
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE).strip().lower()
    return re.sub(r"[-\s]+", "-", value)[:90]


class Command(BaseCommand):
    help = "Create unique topic placeholder publications with fresh open-license images from Openverse."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=12, help="Placeholders per category (10-20 recommended).")
        parser.add_argument("--force", action="store_true", help="Recreate all placeholder publications.")

    def handle(self, *args, **options):
        count = max(10, min(20, options["count"]))
        if options["force"]:
            NewsItem.objects.filter(source__startswith="Открытый фотосток • заглушка").delete()

        existing_images = set(
            NewsItem.objects.exclude(image_url="").values_list("image_url", flat=True)
        )
        used_remote = set()
        created = 0

        for category, query in TOPIC_QUERIES.items():
            titles = TITLE_BANK[category][:count]
            existing_count = NewsItem.objects.filter(
                category=category,
                source__startswith="Открытый фотосток • заглушка",
            ).count()
            if existing_count >= count:
                continue

            results = self.fetch_results(query)
            result_index = 0
            for title in titles:
                if NewsItem.objects.filter(title=title, category=category).exists():
                    continue
                chosen = None
                while result_index < len(results):
                    item = results[result_index]
                    result_index += 1
                    image_url = item.get("url") or item.get("thumbnail") or ""
                    landing = item.get("foreign_landing_url") or item.get("detail_url") or image_url
                    if not image_url or image_url in used_remote:
                        continue
                    chosen = (item, image_url, landing)
                    break
                if not chosen:
                    self.stdout.write(self.style.WARNING(f"{category}: не хватило уникальных открытых изображений"))
                    break

                item, image_url, landing = chosen
                prefix = "stub_" + hashlib.sha1(image_url.encode("utf-8")).hexdigest()[:24]
                local = download_and_process_image(image_url, prefix, category, fallback=False)
                if not local or local in existing_images:
                    continue

                used_remote.add(image_url)
                existing_images.add(local)
                creator = item.get("creator") or ""
                license_name = item.get("license") or ""
                credit = "Openverse"
                if creator:
                    credit += f" · {creator}"
                if license_name:
                    credit += f" · {license_name}"

                stable_url = landing or image_url
                NewsItem.objects.create(
                    title=title,
                    url=stable_url,
                    content=(
                        f"Демонстрационная публикация-заглушка раздела «{category}». "
                        "Текст здесь предназначен для проверки верстки, изображений и карточек."
                    ),
                    summary=f"Заглушка для проверки раздела «{category}».",
                    source="Открытый фотосток • заглушка",
                    author="Контур",
                    category=category,
                    image_url=local,
                    image_credit=credit[:200],
                    published_at=timezone.now() - timedelta(minutes=created),
                    importance_score=0,
                )
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Создано уникальных заглушек: {created} (по {count} на категорию при наличии открытых изображений)."))

    def fetch_results(self, query):
        try:
            response = requests.get(
                OPENVERSE_API,
                params={"q": query, "page_size": 60, "mature": "false"},
                headers={"User-Agent": UA},
                timeout=12,
            )
            response.raise_for_status()
            return response.json().get("results", [])
        except Exception as exc:
            self.stdout.write(self.style.WARNING(f"Openverse: {exc}"))
            return []
