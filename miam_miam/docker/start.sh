#!/bin/sh

set -e

echo "🚀 Démarrage de l'application..."

echo "⏳ Attente de la base de données..."
until php artisan db:show > /dev/null 2>&1; do
    echo "Base de données pas prête, attente..."
    sleep 2
done

echo "✅ Base de données prête!"

echo "🔧 Optimisation Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "📊 Exécution des migrations..."
php artisan migrate --force

if [ "$RUN_SEEDERS" = "true" ]; then
    echo "🌱 Insertion des données initiales..."
    php artisan db:seed --force
fi

echo "🔗 Création du lien storage..."
php artisan storage:link || true

echo "✨ Application prête!"

exec /usr/bin/supervisord -c /etc/supervisord.conf
