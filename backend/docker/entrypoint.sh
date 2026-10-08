#!/bin/sh
set -e

# Inside Compose, MySQL is the `mysql` service — never loopback.
if [ -f /.dockerenv ]; then
  case "${DB_HOST:-}" in
    127.0.0.1|localhost|"")
      export DB_HOST=mysql
      ;;
  esac
fi

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

php artisan config:clear

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force --no-interaction
fi

exec "$@"
