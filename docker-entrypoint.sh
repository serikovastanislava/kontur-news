#!/bin/sh
set -eu
echo "[backend] Applying database migrations..."
python manage.py migrate --noinput
echo "[backend] Collecting static files..."
python manage.py collectstatic --noinput
echo "[backend] Starting: $*"
exec "$@"
