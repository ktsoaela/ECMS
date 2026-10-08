#!/bin/sh
set -e

composer install --no-interaction --prefer-dist
php artisan config:clear

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force --no-interaction
fi

exec "$@"
