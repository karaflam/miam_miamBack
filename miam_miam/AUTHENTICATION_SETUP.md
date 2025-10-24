# 🔐 Configuration de l'Authentification - Mon Miam Miam

## 📋 Vue d'ensemble

Ce document décrit l'intégration complète de l'authentification Laravel avec le frontend React, incluant la séparation des interfaces de connexion pour les étudiants et le staff.

## 🎯 Architecture

### Séparation des interfaces

**1. Espace Étudiant** (`/student-login`)
- Design coloré avec l'identité visuelle de l'application
- Accessible via le footer de la page d'accueil
- Vérifie que seuls les étudiants peuvent se connecter
- Redirection automatique vers `/student` après connexion

**2. Espace Staff** (`/staff-login`)
- Design sombre et professionnel
- Accessible via le footer de la page d'accueil
- Réservé aux admin, manager et employee
- Redirection vers le dashboard approprié selon le rôle

## 📁 Fichiers créés/modifiés

### Frontend (React)

#### Nouvelles pages
- `src/pages/StudentLoginPage.jsx` - Connexion étudiants
- `src/pages/StaffLoginPage.jsx` - Connexion staff
- `src/pages/ForgotPasswordPage.jsx` - Demande de réinitialisation
- `src/pages/ResetPasswordPage.jsx` - Réinitialisation du mot de passe

#### Pages modifiées
- `src/pages/RegisterPage.jsx` - Formulaire complet avec tous les champs Laravel
- `src/pages/HomePage.jsx` - Ajout du footer avec liens de connexion
- `src/context/AuthContext.jsx` - Utilisation des API Laravel
- `src/App.jsx` - Nouvelles routes

#### Nouveau service
- `src/services/api.js` - Configuration axios et services d'authentification

### Backend (Laravel)

#### Contrôleur
- `app/Http/Controllers/Api/AuthController.php` - Endpoints d'authentification

#### Modèle
- `app/Models/User.php` - Ajout du trait `HasApiTokens`

#### Routes
- `routes/api.php` - Routes d'authentification API
- `routes/web.php` - Route fallback pour le SPA

## 🔌 API Endpoints

### Routes publiques

```php
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Routes protégées (authentification requise)

```php
POST /api/auth/logout
GET  /api/auth/user
```

## 📝 Format des requêtes

### Login
```json
{
  "email": "student@test.com",
  "password": "password"
}
```

**Réponse:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "email": "student@test.com",
    "role": "student",
    "balance": 5000,
    "loyaltyPoints": 45
  },
  "token": "1|abc123..."
}
```

### Register
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "telephone": "0612345678",
  "localisation": "Dakar, Sénégal",
  "code_parrain": "ABC12345" // optionnel
}
```

### Forgot Password
```json
{
  "email": "student@test.com"
}
```

### Reset Password
```json
{
  "token": "reset_token_here",
  "email": "student@test.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

## 🚀 Configuration requise

### 1. Laravel Sanctum

Assurez-vous que Sanctum est installé et configuré :

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 2. Variables d'environnement

Dans `.env` :

```env
SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,127.0.0.1:8000
SESSION_DOMAIN=localhost
```

### 3. Configuration CORS

Dans `config/cors.php` :

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'supports_credentials' => true,
```

### 4. Installation des dépendances frontend

```bash
npm install axios
```

## 🔄 Flux d'authentification

### Connexion

1. L'utilisateur accède à `/student-login` ou `/staff-login`
2. Le formulaire envoie les credentials à `/api/auth/login`
3. Laravel vérifie les credentials et génère un token Sanctum
4. Le token est stocké dans `localStorage`
5. L'utilisateur est redirigé vers son dashboard

### Inscription

1. L'utilisateur remplit le formulaire sur `/student-register`
2. Les données sont envoyées à `/api/auth/register`
3. Laravel crée l'utilisateur avec un code de parrainage unique
4. Si un code parrain est fourni, le parrain reçoit 10 points bonus
5. L'utilisateur est automatiquement connecté

### Récupération de mot de passe

1. L'utilisateur clique sur "Mot de passe oublié"
2. Il entre son email sur `/forgot-password`
3. Laravel envoie un email avec un lien de réinitialisation
4. L'utilisateur clique sur le lien (format: `/reset-password?token=xxx&email=xxx`)
5. Il entre son nouveau mot de passe
6. Redirection vers la page de connexion

## 🔒 Sécurité

### Protection CSRF
- Cookie CSRF obtenu automatiquement avant chaque requête d'authentification
- Géré par `axios.get('/sanctum/csrf-cookie')`

### Tokens
- Tokens Sanctum stockés dans `localStorage`
- Ajoutés automatiquement à chaque requête via intercepteur axios
- Révoqués lors de la déconnexion

### Validation
- Validation côté serveur (Laravel)
- Validation côté client (React)
- Messages d'erreur détaillés par champ

## 🎨 Routes frontend

```
/                     → Page d'accueil
/student-login        → Connexion étudiants
/staff-login          → Connexion staff
/student-register     → Inscription étudiants
/forgot-password      → Demande de réinitialisation
/reset-password       → Réinitialisation (avec token)
/student              → Dashboard étudiant (protégé)
/employee             → Dashboard employé (protégé)
/manager              → Dashboard manager (protégé)
/admin                → Dashboard admin (protégé)
```

## 🧪 Tests

### Comptes de test

**Étudiant:**
- Email: `student@test.com`
- Password: `password`

**Employé:**
- Email: `employee@test.com`
- Password: `password`

**Manager:**
- Email: `manager@test.com`
- Password: `password`

**Admin:**
- Email: `admin@test.com`
- Password: `password`

### Tester l'authentification

1. Démarrer les serveurs:
```bash
php artisan serve
npm run dev
```

2. Accéder à `http://127.0.0.1:8000`

3. Tester les scénarios:
   - ✅ Connexion étudiant
   - ✅ Connexion staff
   - ✅ Inscription nouveau compte
   - ✅ Déconnexion
   - ✅ Rafraîchissement de page (persistance session)
   - ✅ Accès direct à une route protégée (redirection)
   - ✅ Mot de passe oublié

## 🐛 Dépannage

### Erreur 419 (CSRF Token Mismatch)
- Vérifier que `SESSION_DOMAIN` est correct dans `.env`
- Vider le cache: `php artisan config:clear`
- Vérifier que les cookies sont activés dans le navigateur

### Erreur 401 (Unauthorized)
- Vérifier que le token est présent dans `localStorage`
- Vérifier que Sanctum est correctement configuré
- Vérifier que `HasApiTokens` est ajouté au modèle User

### Erreur CORS
- Vérifier `config/cors.php`
- Vérifier `SANCTUM_STATEFUL_DOMAINS` dans `.env`
- Redémarrer le serveur Laravel

### Token non persistant
- Vérifier que `withCredentials: true` est dans la config axios
- Vérifier que les cookies sont autorisés

## 📚 Ressources

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Router Documentation](https://reactrouter.com/)

## ✅ Checklist de déploiement

- [ ] Configurer les variables d'environnement de production
- [ ] Configurer l'envoi d'emails pour la récupération de mot de passe
- [ ] Ajouter la limitation de taux (rate limiting) sur les endpoints d'authentification
- [ ] Configurer HTTPS
- [ ] Tester tous les flux d'authentification en production
- [ ] Supprimer les comptes de test de la base de données de production
- [ ] Configurer les logs d'authentification
- [ ] Mettre en place la vérification d'email (optionnel)

## 🎉 Fonctionnalités implémentées

✅ Séparation des interfaces de connexion (Étudiants / Staff)  
✅ Authentification complète avec Laravel Sanctum  
✅ Inscription avec système de parrainage  
✅ Récupération de mot de passe  
✅ Gestion des sessions et tokens  
✅ Validation des formulaires  
✅ Messages d'erreur détaillés  
✅ Protection des routes  
✅ Persistance de la session  
✅ Déconnexion sécurisée  

---

**Date de création:** 24 octobre 2025  
**Version:** 1.0.0
