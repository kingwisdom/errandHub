#!/bin/sh
set -e

echo "==> Waiting for MySQL..."
until php -r "
    try {
        new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '3306'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
        exit(0);
    } catch (PDOException \$e) {
        exit(1);
    }
" 2>/dev/null; do
    sleep 2
done
echo "==> MySQL is ready."

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Seeding database..."
php artisan db:seed --force || true

echo "==> Creating storage link..."
php artisan storage:link --force || true

echo "==> Caching config..."
php artisan config:cache
php artisan route:cache
php artisan view:cache || true

echo "==> Setting permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Starting services..."
exec "$@"
