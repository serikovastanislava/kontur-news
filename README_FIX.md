# Важное исправление: Pillow

В парсере используется `PIL.Image`, поэтому зависимость `Pillow` должна быть установлена внутри backend/parser Docker image.

После обновления файлов обязательно пересоберите контейнеры:

```bash
docker compose down
docker compose build --no-cache backend parser
# если сервис parser отсутствует, пересоберите backend:
# docker compose build --no-cache backend

docker compose up -d
```

Если контейнеры называются иначе, используйте соответствующие имена из `docker compose config --services`.
