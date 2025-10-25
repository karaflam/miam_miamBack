# Guide de démarrage de l'application

## Architecture

Votre application utilise:
- **Backend**: Laravel (API)
- **Frontend**: React SPA intégré via Vite

## Démarrage en développement

### 1. Terminal 1 - Backend Laravel
```bash
cd miam_miam
php artisan serve
```
Le backend sera accessible sur `http://localhost:8000`

### 2. Terminal 2 - Frontend Vite
```bash
cd miam_miam
npm run dev
# ou
pnpm dev
```
Vite compilera votre frontend React et le servira via Laravel

### 3. Accéder à l'application
Ouvrez votre navigateur sur: `http://localhost:8000`

## Routes importantes

- `/` - Page d'accueil (React)
- `/student-login` - Connexion étudiants
- `/staff-login` - Connexion staff
- `/employee` - Dashboard employé
- `/manager` - Dashboard manager
- `/admin` - Dashboard admin

## API

Toutes les routes API sont préfixées par `/api`:
- `/api/auth/login` - Connexion étudiants
- `/api/staff/login` - Connexion staff
- `/api/commandes` - Commandes
- etc.

## Problèmes courants

### "Page blanche après connexion"
**Cause**: Vite n'est pas démarré
**Solution**: Lancez `npm run dev` dans un terminal séparé

### "404 sur les routes React"
**Cause**: Le fallback route ne fonctionne pas
**Solution**: Vérifiez que `routes/web.php` contient la route fallback

### "CORS errors"
**Cause**: Configuration Sanctum
**Solution**: Vérifiez `.env` - `SANCTUM_STATEFUL_DOMAINS` et `SESSION_DOMAIN`

## Configuration .env importante

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8000

SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost

SANCTUM_STATEFUL_DOMAINS=localhost:8000,localhost
```

## Commandes utiles

### Nettoyer le cache
```bash
php artisan optimize:clear
```

### Recréer la base de données
```bash
php artisan migrate:fresh --seed
```

### Installer les dépendances
```bash
# Backend
composer install

# Frontend
npm install
# ou
pnpm install
```

## Comptes de test

### Staff
- **Employé**: `employee@test.com` / `password`
- **Manager**: `manager@test.com` / `password`
- **Admin**: `admin@test.com` / `password`

### Étudiants
Créez-en via la page d'inscription `/student-register`
