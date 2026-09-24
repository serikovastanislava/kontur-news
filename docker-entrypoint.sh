#!/bin/sh
set -eu

python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Keep migrations and the Telegram parser in the same application container.
# The parser starts only after migrations have completed, so there is no second
# container racing Django's migration state.
# Telegram channels are parsed once every 60 seconds.
python manage.py parse_news --loop --interval 60 --repair-images "${TELEGRAM_REPAIR_LIMIT:-200}" &
PARSER_PID=$!

cleanup() {
    kill "$PARSER_PID" 2>/dev/null || true
    wait "$PARSER_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

exec "$@"
