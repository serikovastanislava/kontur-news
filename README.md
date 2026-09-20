# Kontur News Portal — Docker full stack

Проект объединён в один стек:

- **React + Vite** — интерфейс;
- **Django + DRF** — API;
- **PostgreSQL** — основная база данных;
- **JWT** — регистрация, вход и авторизация;
- **parser** — отдельный контейнер, который обновляет новости каждые 60 секунд;
- **Nginx** — отдаёт React и проксирует `/api/` и `/admin/` в Django.

## 1. Запуск всего проекта через Docker

Установи Docker Desktop и выполни в корне проекта:

```bash
copy .env.example .env
```

Для PowerShell:

```powershell
Copy-Item .env.example .env
```

В `.env` обязательно измени `POSTGRES_PASSWORD` и `DJANGO_SECRET_KEY` перед использованием не только локально.

Затем:

```bash
docker compose up --build
```

После запуска:

- сайт: http://localhost:8080
- Django API: http://localhost:8080/api/news/
- Django admin: http://localhost:8080/admin/
- PostgreSQL работает внутри Docker-сети и наружу не публикуется.

## 2. Создать администратора

В отдельном терминале:

```bash
docker compose exec backend python manage.py createsuperuser
```

## 3. Проверить состояние

```bash
docker compose ps
docker compose logs -f backend
```

Логи парсера:

```bash
docker compose logs -f parser
```

## 4. Как теперь связаны части

Браузер открывает `localhost:8080` → Nginx отдаёт React.

React обращается к `/api/...` → Nginx проксирует запрос в Django.

Django подключается к PostgreSQL по имени сервиса `db`.

Контейнер `parser` использует те же Django-модели и PostgreSQL и каждые 60 секунд добавляет новые новости.

Регистрация и вход создают пользователя в PostgreSQL. JWT хранится на клиенте; избранное хранится в таблице `news_app_favoritenews` и больше не зависит от одного браузера.

## 5. Полезные команды

Остановить:

```bash
docker compose down
```

Остановить и удалить БД:

```bash
docker compose down -v
```

Важно: `down -v` удалит PostgreSQL volume и все данные базы.

Пересобрать:

```bash
docker compose build --no-cache
```

Применить миграции вручную:

```bash
docker compose exec backend python manage.py migrate
```

Запустить парсер один раз:

```bash
docker compose exec backend python manage.py parse_news
```

Проверить Django:

```bash
docker compose exec backend python manage.py check
```

## Локальная разработка без Docker

Backend:

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend:

```bash
npm install
npm run dev
```

Vite проксирует `/api` на `127.0.0.1:8000`.
