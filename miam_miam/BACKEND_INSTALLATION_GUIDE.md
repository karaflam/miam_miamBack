# 🚀 Guide d'Installation et Configuration - Backend Laravel

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Base de Données](#base-de-données)
5. [Lancement de l'Application](#lancement-de-lapplication)
6. [Configuration des Services Tiers](#configuration-des-services-tiers)
7. [Déploiement](#déploiement)
8. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Logiciels Requis

| Logiciel | Version Minimale | Recommandé |
|----------|------------------|------------|
| **PHP** | 8.2 | 8.2+ |
| **Composer** | 2.x | Dernière version |
| **MySQL/MariaDB** | 8.0 | 8.0+ |
| **Node.js** | 18.x | 20.x+ |
| **npm/pnpm** | 9.x | Dernière version |

### Extensions PHP Requises

```bash
php -m
# Vérifier les extensions :
- BCMath
- Ctype
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- PDO_MySQL
- Tokenizer
- XML
- GD ou Imagick (pour Intervention Image)
```

---

## 📦 Installation

### 1. Cloner le Projet

```bash
git clone https://github.com/votre-repo/miam-miam-back.git
cd miam-miam-back/miam_miam
```

### 2. Installer les Dépendances PHP

```bash
composer install
```

**Dépendances principales installées :**
- `laravel/framework` : ^12.0
- `laravel/sanctum` : ^4.2 (Authentification API)
- `cinetpay/cinetpay-php` : ^1.9 (Paiement mobile)
- `intervention/image` : ^3.11 (Manipulation d'images)
- `inertiajs/inertia-laravel` : ^2.0
- `tightenco/ziggy` : ^2.0

### 3. Installer les Dépendances Node.js

```bash
npm install
# ou
pnpm install
```

---

## ⚙️ Configuration

### 1. Fichier d'Environnement

Copier le fichier `.env.example` :

```bash
cp .env.example .env
```

### 2. Générer la Clé d'Application

```bash
php artisan key:generate
```

### 3. Configuration `.env`

Éditer le fichier `.env` avec vos paramètres :

```env
# Application
APP_NAME="Mon Miam Miam"
APP_ENV=local
APP_KEY=base64:VOTRE_CLE_GENEREE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=miam_miam_db
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe

# Sessions et Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# CinetPay (Paiement Mobile)
CINETPAY_API_KEY=votre_cle_api
CINETPAY_SITE_ID=votre_site_id
CINETPAY_SECRET_KEY=votre_secret_key
CINETPAY_MODE=PRODUCTION  # ou TEST

# Mail (optionnel)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@monmiammiam.com
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
SESSION_DOMAIN=localhost
```

---

## 🗄️ Base de Données

### 1. Créer la Base de Données

**Via MySQL CLI :**

```sql
CREATE DATABASE miam_miam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Via phpMyAdmin :**
- Créer une nouvelle base de données
- Nom : `miam_miam_db`
- Interclassement : `utf8mb4_unicode_ci`

### 2. Exécuter les Migrations

```bash
php artisan migrate
```

**Migrations créées (ordre d'exécution) :**
1. `users` - Utilisateurs (étudiants)
2. `cache`, `jobs` - Système Laravel
3. `roles` - Rôles (student, employee, manager, admin)
4. `categories_menu` - Catégories de plats
5. `menus` - Articles du menu
6. `commandes` - Commandes
7. `details_commandes` - Détails des commandes
8. `paiements` - Transactions
9. `evenements` - Promotions, événements, mini-jeux
10. `parrainages` - Système de parrainage
11. `suivi_points` - Historique points de fidélité
12. `reclamations` - Réclamations clients
13. `employes` - Employés du restaurant
14. `stocks` - Gestion des stocks
15. `consentements` - RGPD
16. `activites` - Logs d'activités

### 3. Peupler la Base (Seeders)

```bash
php artisan db:seed
```

**Seeders disponibles :**
- `RoleSeeder` : Crée les 4 rôles
- `UserSeeder` : Utilisateurs de test
- `CategorieMenuSeeder` : Catégories de plats
- `MenuSeeder` : Articles exemple

### 4. Tout Réinitialiser (Fresh Migration)

```bash
# ⚠️ ATTENTION : Supprime toutes les données
php artisan migrate:fresh --seed
```

---

## 🚀 Lancement de l'Application

### Mode Développement

#### Option 1 : Commandes Séparées

**Terminal 1 : Serveur Laravel**
```bash
php artisan serve
# Application accessible sur http://localhost:8000
```

**Terminal 2 : Queue Worker (si utilisé)**
```bash
php artisan queue:listen
```

**Terminal 3 : Logs en temps réel**
```bash
php artisan pail
```

**Terminal 4 : Frontend Vite**
```bash
cd resources/js/frontend
npm run dev
```

#### Option 2 : Script Composer (Recommandé)

```bash
composer dev
```

Cette commande lance automatiquement :
- Serveur PHP (`php artisan serve`)
- Queue worker
- Logs (`pail`)
- Frontend Vite

### Accès à l'Application

- **Backend API** : http://localhost:8000/api
- **Frontend** : http://localhost:8000 (ou port Vite)
- **Test API** : http://localhost:8000/api/test

---

## 🔌 Configuration des Services Tiers

### CinetPay (Paiement Mobile)

#### 1. Créer un Compte

- Aller sur [cinetpay.com](https://cinetpay.com)
- S'inscrire comme marchand
- Obtenir les identifiants

#### 2. Configuration

Dans `.env` :
```env
CINETPAY_API_KEY=12345678901234567890
CINETPAY_SITE_ID=123456
CINETPAY_SECRET_KEY=votre_secret_key_ici
CINETPAY_MODE=TEST  # TEST ou PRODUCTION
```

#### 3. Webhook

Configurer l'URL de notification dans le dashboard CinetPay :
```
https://votre-domaine.com/api/cinetpay/notify
```

### Service Mail (Gmail)

#### 1. Mot de Passe d'Application

- Activer l'authentification à 2 facteurs sur Gmail
- Générer un mot de passe d'application
- Utiliser ce mot de passe dans `.env`

#### 2. Configuration

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre.email@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop  # Mot de passe app (16 caractères)
MAIL_ENCRYPTION=tls
```

### Stockage d'Images

#### Créer le Lien Symbolique

```bash
php artisan storage:link
```

Crée un lien symbolique de `storage/app/public` vers `public/storage`.

**Upload d'images accessible via :**
```
http://localhost:8000/storage/menu/nom-image.jpg
http://localhost:8000/storage/evenements/affiche.jpg
```

---

## 📦 Build pour Production

### 1. Optimiser l'Application

```bash
# Optimiser l'autoloader
composer install --optimize-autoloader --no-dev

# Cache de configuration
php artisan config:cache

# Cache des routes
php artisan route:cache

# Cache des vues
php artisan view:cache

# Build du frontend
npm run build
```

### 2. Variables d'Environnement Production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://monmiammiam.com

DB_HOST=adresse_db_production
DB_DATABASE=miam_miam_prod
DB_USERNAME=utilisateur_prod
DB_PASSWORD=mot_de_passe_securise

CINETPAY_MODE=PRODUCTION
```

---

## 🌐 Déploiement

### Serveur Partagé (cPanel)

#### 1. Préparer les Fichiers

```bash
# Build local
npm run build
composer install --no-dev

# Créer une archive
tar -czf app.tar.gz *
```

#### 2. Upload via FTP/SSH

- Uploader dans le dossier racine (hors `public_html`)
- Déplacer le contenu de `public/` vers `public_html/`

#### 3. Configuration .htaccess

Dans `public_html/.htaccess` :
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

#### 4. Modifier index.php

Ajuster les chemins dans `public_html/index.php` :
```php
require __DIR__.'/../bootstrap/app.php';
```

### VPS/Serveur Dédié (Ubuntu)

#### 1. Prérequis Serveur

```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

# Installer PHP 8.2
sudo apt install php8.2 php8.2-{fpm,mysql,xml,curl,gd,mbstring,zip,bcmath}

# Installer MySQL
sudo apt install mysql-server

# Installer Nginx
sudo apt install nginx

# Installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 2. Configuration Nginx

`/etc/nginx/sites-available/monmiammiam.com` :

```nginx
server {
    listen 80;
    server_name monmiammiam.com www.monmiammiam.com;
    root /var/www/monmiammiam/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### 3. SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d monmiammiam.com -d www.monmiammiam.com
```

#### 4. Permissions

```bash
sudo chown -R www-data:www-data /var/www/monmiammiam
sudo chmod -R 755 /var/www/monmiammiam
sudo chmod -R 775 /var/www/monmiammiam/storage
sudo chmod -R 775 /var/www/monmiammiam/bootstrap/cache
```

---

## 🛠️ Dépannage

### Erreur : "No application encryption key"

```bash
php artisan key:generate
```

### Erreur : "SQLSTATE[HY000] [2002] Connection refused"

- Vérifier que MySQL est démarré : `sudo service mysql start`
- Vérifier les credentials dans `.env`
- Tester la connexion : `php artisan tinker` puis `DB::connection()->getPdo();`

### Erreur : "Class 'Intervention\Image\...' not found"

```bash
composer require intervention/image
```

### Erreur 500 après migration

```bash
# Vider le cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Permissions
chmod -R 775 storage bootstrap/cache
```

### Queue Jobs ne s'exécutent pas

```bash
# En développement
php artisan queue:listen

# En production avec Supervisor
sudo apt install supervisor
```

Configuration Supervisor (`/etc/supervisor/conf.d/laravel-worker.conf`) :
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/monmiammiam/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/monmiammiam/storage/logs/worker.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

### Images ne s'affichent pas

```bash
# Créer le lien symbolique
php artisan storage:link

# Vérifier les permissions
chmod -R 775 storage/app/public
```

---

## 📊 Commandes Utiles

### Développement

```bash
# Logs en temps réel
php artisan pail

# Lancer tinker (REPL)
php artisan tinker

# Lister toutes les routes
php artisan route:list

# Créer un controller
php artisan make:controller NomController

# Créer un model avec migration
php artisan make:model NomModel -m

# Créer une migration
php artisan make:migration create_nom_table
```

### Maintenance

```bash
# Mode maintenance ON
php artisan down

# Mode maintenance OFF
php artisan up

# Nettoyer les caches
php artisan optimize:clear

# Backup base de données
mysqldump -u root -p miam_miam_db > backup.sql

# Restaurer
mysql -u root -p miam_miam_db < backup.sql
```

---

## 🔒 Sécurité

### Checklist Production

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] Changement de tous les mots de passe par défaut
- [ ] SSL/HTTPS activé
- [ ] Firewall configuré (UFW)
- [ ] Sauvegardes automatiques
- [ ] Logs d'erreurs activés
- [ ] Sanitization des inputs
- [ ] Rate limiting activé
- [ ] CORS configuré correctement

### Configuration Firewall (UFW)

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2024  
**Support** : support@monmiammiam.com
