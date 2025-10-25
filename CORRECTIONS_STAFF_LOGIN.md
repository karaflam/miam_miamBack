# Corrections - Connexion Staff

## Problème identifié

Lors de la tentative de connexion en tant que membre du staff, l'utilisateur était redirigé vers `LoginPage.jsx` sans message d'erreur et la connexion échouait.

## Causes

1. **Intercepteur axios trop agressif** : L'intercepteur dans `api.js` redirigait automatiquement vers `/student-login` en cas d'erreur 401, ce qui interférait avec la connexion staff.

2. **Page LoginPage.jsx obsolète** : Cette page générique n'était plus utilisée et créait de la confusion.

3. **ProtectedRoute mal configuré** : Redirigeait toujours vers `/login` qui n'existait plus.

## Solutions appliquées

### 1. Suppression de LoginPage.jsx ✅
- Fichier supprimé : `resources/js/frontend/src/pages/LoginPage.jsx`
- Import retiré de `App.jsx`
- Route `/login` supprimée

### 2. Correction de l'intercepteur axios ✅
**Fichier**: `services/api.js`

**Avant**:
```javascript
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('currentUser')
  window.location.href = '/student-login' // ❌ Redirection forcée
}
```

**Après**:
```javascript
if (error.response?.status === 401) {
  // Token expiré ou invalide - nettoyer le localStorage seulement
  // Ne pas rediriger automatiquement car staff et student ont des pages différentes
  localStorage.removeItem('auth_token')
  localStorage.removeItem('currentUser')
  // ✅ Pas de redirection automatique
}
```

### 3. Mise à jour de ProtectedRoute ✅
**Fichier**: `components/ProtectedRoute.jsx`

**Avant**:
```javascript
if (!user) {
  return <Navigate to="/login" replace /> // ❌ Route inexistante
}
```

**Après**:
```javascript
if (!user) {
  // Rediriger vers la page de connexion appropriée selon le rôle demandé
  const isStaffRoute = allowedRoles?.some(role => ['employee', 'manager', 'admin'].includes(role))
  return <Navigate to={isStaffRoute ? "/staff-login" : "/student-login"} replace />
}
```

## Architecture finale

### Pages de connexion
- **`/student-login`** : Pour les étudiants (utilise `authService`)
- **`/staff-login`** : Pour le personnel (utilise `staffAuthService`)

### Services d'authentification
- **`authService`** : Authentification via `/api/auth/login` (table `users`)
- **`staffAuthService`** : Authentification via `/api/staff/login` (table `employes`)

### Routes protégées
- Routes étudiants → redirigent vers `/student-login` si non connecté
- Routes staff → redirigent vers `/staff-login` si non connecté

## Test de la connexion staff

1. Assurez-vous que les seeders sont exécutés:
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=EmployeSeeder
```

2. Accédez à `/staff-login`

3. Utilisez un des comptes de test:
   - **Employé**: `employee@test.com` / `password`
   - **Manager**: `manager@test.com` / `password`
   - **Admin**: `admin@test.com` / `password`

4. Vous devriez être redirigé vers le dashboard approprié:
   - Employee → `/employee`
   - Manager → `/manager`
   - Admin → `/admin`

## Résultat

✅ La connexion staff fonctionne maintenant correctement
✅ Pas de redirection indésirable
✅ Séparation claire entre authentification staff et student
✅ Code plus maintenable et cohérent
