# Контур — новостной портал


# Архитектура

```text
Контур/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── news_app/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── parser.py
│   ├── category.py
│   ├── management/
│   └── migrations/
│
├── users_app/
│   ├── views.py
│   └── serializers.py
│
├── src/
│   ├── App.jsx
│   ├── api.js
│   ├── hooks/
│   ├── state/
│   ├── utils/
│   ├── data/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── news/
│   │   └── widgets/
│   └── styles.css
│
├── public/
├── docker/
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.frontend
├── package.json
├── package-lock.json
├── requirements.txt
└── manage.py
```

## Frontend

Основные технологии:

- React 18;
- Vite;
- JavaScript/JSX;
- Lucide React для большинства интерфейсных иконок;
- SVG-иконка Bootstrap-style `chat-dots` для обсуждений.

Основные компоненты:

- `App.jsx` — корневой интерфейс;
- `Header.jsx` — верхняя навигация и поиск;
- `Sidebar.jsx` — боковая навигация;
- `SourcesFeed.jsx` — новости из backend;
- `HeroNews.jsx` — главный материал;
- `PopularGrid.jsx` — популярные материалы;
- `Editorial.jsx` — мнение редакции и мультимедиа;
- `RightRail.jsx` — правая колонка;
- `AdBanner.jsx` — рекламная плашка;
- `CurrencyWidget.jsx` — курсы валют;
- `DiscussionsDrawer.jsx` — панель и чаты обсуждений;
- `ModalRoot.jsx` — Article Reader, поиск, авторизация и другие модальные окна.

## Backend

Backend построен на:

- Django;
- Django REST Framework;
- SimpleJWT;
- PostgreSQL в Docker;
- SQLite для быстрого локального запуска.

Основная модель новостей:

```python
NewsItem
```

В ней находятся заголовок, URL, содержание, категория, источник, изображение, дата публикации, просмотры и другие данные.

Обсуждения хранятся в:

```python
DiscussionMessage
```

Связь:

```text
NewsItem 1 ─── N DiscussionMessage N ─── 1 User
```

---

# API

## Авторизация

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/me/
```

## Новости

```text
GET /api/news/
GET /api/news/featured/
GET /api/news/search/?q=...
GET /api/news/<id>/view/
GET /api/news/favorites/
POST /api/news/<id>/like/
DELETE /api/news/<id>/like/
```

## Обсуждения

```text
GET  /api/discussions/
GET  /api/news/<id>/discussion/
POST /api/news/<id>/discussion/
```

`GET` доступен всем.

`POST` требует JWT пользователя.

## Перевод

```text
POST /api/news/translate/
```

## Валюты

```text
GET /api/news/currency/
```

---

# Парсер новостей

Распарсенные материалы должны сохраняться в `NewsItem`.

Именно эта таблица является источником для:

- ленты новостей;
- поиска;
- обсуждений;
- главного материала;
- карточек категорий;
- популярных материалов;
- статистики просмотров.

При добавлении нового источника желательно сохранять:

- уникальный URL;
- заголовок;
- полный текст;
- краткое содержание;
- источник;
- категорию;
- дату публикации.

---

# Запуск локально

## Backend

Создать окружение и установить зависимости:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Для Windows:

```powershell
.venv\Scripts\activate
pip install -r requirements.txt
```

Применить миграции:

```bash
python manage.py migrate
```

Запустить backend:

```bash
python manage.py runserver
```

## Frontend

```bash
npm install
npm run dev
```

Для production-сборки:

```bash
npm run build
```

---

# Docker

Основной запуск:

```bash
docker compose up --build
```

В Docker используется PostgreSQL.

Перед production-развёртыванием необходимо задать секреты и параметры окружения через `.env`.

---

# База данных

После изменений моделей необходимо создавать миграцию:

```bash
python manage.py makemigrations
```

и применять её:

```bash
python manage.py migrate
```

Для v11 добавлена миграция:

```text
news_app/migrations/0014_discussion_message.py
```

Она создаёт таблицу сообщений обсуждений.

---

# Обновление новостей

Frontend периодически обновляет ленту из API.

Обсуждения используют отдельные интервалы:

```text
новости обсуждений — 30 секунд
сообщения открытого чата — 5 секунд
```

Курс валют:

```text
10 минут
```

---

# Поиск

Поиск не зависит от `src/data/news.js`.

Запрос:

```text
/api/news/search/?q=санкции
```

Backend разбивает запрос на слова и требует совпадение каждого слова хотя бы в одном из поисковых полей новости.

Например:

```text
санкции компании
```

будет искать новости, где встречаются оба термина в заголовке, содержании, категории, источнике или summary.

---

# Обсуждения: логика доступа

Посетитель без аккаунта:

```text
видит список новостей
        ↓
открывает обсуждение
        ↓
читает сообщения
        ↓
для отправки → авторизация
```

Авторизованный пользователь:

```text
открывает новость
        ↓
читает обсуждение
        ↓
пишет сообщение
        ↓
POST /api/news/<id>/discussion/
```

Сервер не доверяет состоянию React: даже если вручную отправить POST без токена, backend вернёт `401`.

---

# Очистка проекта

В проекте не хранятся:

- `node_modules`;
- `dist`;
- `__pycache__`;
- `.pyc`;
- временные архивы;
- старые неиспользуемые компоненты.

После удаления `Коротко` также удалены его frontend-компонент и связанные с ним стили.

Старые демонстрационные данные поиска удалены из клиентского поискового контура: поиск теперь использует реальную БД.

---

# Проверка перед релизом

Рекомендуется выполнить:

```bash
python manage.py check
python manage.py migrate
npm run build
```

После запуска проверить:

- загрузку новостей из БД;
- поиск по словам из реально распарсенной новости;
- открытие статьи;
- перевод статьи на английский;
- обновление курса валют;
- открытие панели обсуждений;
- чтение сообщений без авторизации;
- отправку сообщения зарегистрированным пользователем;
- отказ в отправке сообщения без авторизации;
- обновление сообщений в открытом чате;
- адаптивное отображение панели обсуждений на мобильном экране.

---

# Примечание о realtime

Текущая реализация обсуждений использует HTTP polling. Это намеренное решение для простоты развёртывания.

Если в дальнейшем потребуется большое количество одновременных пользователей, обсуждения можно перевести на Django Channels/WebSocket + Redis без изменения модели `DiscussionMessage` и публичной структуры данных.
