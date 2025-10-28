#!/bin/sh
# Script de démarrage de l'application

set -e

echo "🚀 Démarrage de l'application..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
until php artisan db:show > /dev/null 2>&1; do
    echo "Base de données pas prête, attente..."
    sleep 2
done

echo "✅ Base de données prête!"

# Optimiser Laravel (mise en cache)
echo "🔧 Optimisation Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Lancer les migrations (créer/mettre à jour les tables)
echo "📊 Exécution des migrations..."
php artisan migrate --force

# Lancer les seeders (données initiales) - SEULEMENT au premier déploiement
if [ "$RUN_SEEDERS" = "true" ]; then
    echo "🌱 Insertion des données initiales..."
    php artisan db:seed --force
fi

# Créer le lien symbolique pour le storage
echo "🔗 Création du lien storage..."
php artisan storage:link || true

echo "✨ Application prête!"

# Démarrer tous les services (PHP, Nginx, Worker)
exec /usr/bin/supervisord -c /etc/supervisord.conf
```

**💡 Ce que ça fait :**
- Attend que PostgreSQL soit prêt
- Lance les migrations de base de données
- Optimise Laravel
- Démarre l'application

---

### 1.6 Créer `.dockerignore`

À la **racine** du projet, crée le fichier `.dockerignore` :
```
.git
.gitignore
.env
.env.*
!.env.example
node_modules
vendor
storage/app/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
storage/logs/*
bootstrap/cache/*
public/storage
public/hot
tests
*.log
.phpunit.result.cache
README.md
docker-compose.yml
```

**💡 Ce que ça fait :**
- Indique à Docker quels fichiers ne PAS copier dans l'image
- Réduit la taille de l'image finale

---

## Étape 2 : Configurer PostgreSQL (Base de données)

### 2.1 Créer une base de données sur Neon (GRATUIT)

1. **Va sur [neon.tech](https://neon.tech)**
2. **Clique sur "Sign up" et connecte-toi avec GitHub**
3. **Clique sur "Create a project"**
   - Nom : `miam-miam`
   - Region : `AWS / US East (Ohio)` (ou Europe si dispo)
4. **Note les informations de connexion** qui s'affichent :
```
Host: ep-xxxxx-xxxxx.us-east-2.aws.neon.tech
Database: neondb
Username: neondb_owner
Password: xxxxxxxxxx