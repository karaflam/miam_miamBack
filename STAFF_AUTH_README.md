# Authentification Staff - Documentation

## Modifications apportées

### Backend (Laravel)

1. **Nouveau contrôleur**: `StaffAuthController.php`
   - Gère l'authentification des employés depuis la table `employes`
   - Routes: `/api/staff/login`, `/api/staff/logout`, `/api/staff/user`

2. **Modèle Employe mis à jour**
   - Ajout du trait `HasApiTokens` pour l'authentification Sanctum

3. **Routes API** (`routes/api.php`)
   - Nouvelles routes pour l'authentification staff séparées des utilisateurs

4. **Seeder**: `EmployeSeeder.php`
   - Crée des comptes de test pour le staff

### Frontend (React)

1. **Service API** (`services/api.js`)
   - Nouveau service `staffAuthService` pour l'authentification staff
   - Méthodes: `login()`, `logout()`, `getCurrentUser()`

2. **Page de connexion** (`StaffLoginPage.jsx`)
   - Utilise maintenant `staffAuthService` au lieu de `authService`
   - Authentification directe avec la table `employes`

## Comptes de test

Après avoir exécuté les seeders, vous aurez accès à ces comptes:

- **Employé**: `employee@test.com` / `password`
- **Manager**: `manager@test.com` / `password`
- **Admin**: `admin@test.com` / `password`

## Installation

1. Exécuter les migrations (si pas déjà fait):
```bash
php artisan migrate
```

2. Exécuter les seeders:
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=EmployeSeeder
```

Ou exécuter tous les seeders:
```bash
php artisan db:seed
```

## Mapping des rôles

Les rôles de la base de données sont mappés vers les rôles frontend:

| Base de données | Frontend |
|----------------|----------|
| employe        | employee |
| gerant         | manager  |
| administrateur | admin    |

## Routes API

### Publiques
- `POST /api/staff/login` - Connexion staff

### Protégées (nécessite authentification)
- `POST /api/staff/logout` - Déconnexion staff
- `GET /api/staff/user` - Récupérer l'utilisateur connecté

## Différences avec l'authentification utilisateur

- **Table**: `employes` au lieu de `users`
- **Endpoint**: `/api/staff/*` au lieu de `/api/auth/*`
- **Service**: `staffAuthService` au lieu de `authService`
- **Vérification**: Seuls les employés actifs (`actif = 'oui'`) peuvent se connecter
