#!/bin/sh
set -e

cd /var/www/html

# Laravel expects an env file; Compose still supplies the database settings.
[ -f .env ] || touch .env

# Wait until MySQL accepts connections.
until php -r 'try { new PDO("mysql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT").";dbname=".getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD")); exit(0); } catch (Throwable $e) { exit(1); }' >/dev/null 2>&1; do
    echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
    sleep 2
done

# The bind mount hides the vendor directory baked into the image.
if [ ! -f vendor/autoload.php ]; then
    composer install --optimize-autoloader --no-interaction
fi

# Do not rotate the key on every container start. The host .env may already
# contain a key even though APP_KEY is not exported into the container.
if [ -z "${APP_KEY}" ] && ! grep -Eq '^APP_KEY=.+' .env 2>/dev/null; then
    php artisan key:generate --force --no-interaction
fi

mkdir -p /tmp/laravel
chown -R www-data:www-data /tmp/laravel
chmod 775 /tmp/laravel
php artisan config:clear >/dev/null 2>&1 || true
php artisan migrate --force --no-interaction

# Cache routes/config/views once per container start. This removes repeated
# bootstrap work from the first request and keeps API navigation snappy.
php artisan optimize --no-interaction >/dev/null 2>&1 || true

if [ "${RUN_SEED:-true}" = "true" ]; then
    php artisan db:seed --force --no-interaction
fi

# Index creation is idempotent; do not block the app if MongoDB is down.
php artisan app:ensure-mongo-indexes --no-interaction \
    || echo "MongoDB indexes not created (MongoDB unavailable)."

exec php-fpm
