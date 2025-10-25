# Correction des erreurs 401/403 lors de l'accès aux espaces staff

## Problème identifié

Lors de l'accès aux espaces staff (AdminDashboard), les utilisateurs rencontraient des erreurs :
- **401 Unauthorized** : L'utilisateur n'est pas authentifié
- **403 Forbidden** : L'utilisateur est authentifié mais n'a pas les permissions nécessaires

## Cause du problème

Le middleware `CheckRole` ne gérait pas correctement la vérification des rôles pour les employés. Voici les problèmes identifiés :

1. **Correspondance des rôles insuffisante** : Le middleware ne reconnaissait pas toutes les variantes de noms de rôles (administrateur, admin, employé, employee, etc.)

2. **Gestion des deux types d'utilisateurs** : Le système a deux types d'utilisateurs :
   - `User` (étudiants/clients) - table `users`
   - `Employe` (staff) - table `employes`
   
   Le middleware ne gérait que les employés et rejetait automatiquement les utilisateurs normaux.

## Solutions appliquées

### 1. Amélioration du middleware CheckRole

**Fichier modifié** : `app/Http/Middleware/CheckRole.php`

**Changements** :
- Ajout d'un système de correspondance flexible des rôles
- Support des variantes de noms (français/anglais)
- Gestion correcte des deux types d'utilisateurs (User et Employe)

```php
// Correspondances possibles pour chaque rôle
$roleMatches = [
    'admin' => ['admin', 'administrateur', 'administrator'],
    'employe' => ['employe', 'employé', 'employee', 'staff', 'gerant', 'gestionnaire', 'manager'],
    'manager' => ['gerant', 'gestionnaire', 'manager'],
    'student' => ['student', 'etudiant', 'utilisateur'],
];
```

### 2. Ajout d'un endpoint de diagnostic

**Fichier créé** : `app/Http/Controllers/Api/DiagnosticController.php`

**Route** : `GET /api/diagnostic/auth` (protégée par `auth:sanctum`)

Cet endpoint permet de diagnostiquer les problèmes d'authentification en retournant :
- Le type d'utilisateur (User ou Employe)
- Les informations de rôle
- Le statut d'authentification

**Utilisation** :
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/diagnostic/auth
```

## Comment tester

### 1. Vérifier l'authentification

Après vous être connecté en tant que staff, testez l'endpoint de diagnostic :

```javascript
const token = localStorage.getItem('auth_token');
fetch('http://localhost:8000/api/diagnostic/auth', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Diagnostic:', data));
```

### 2. Vérifier l'accès aux routes admin

Testez l'accès à la liste des utilisateurs :

```javascript
const token = localStorage.getItem('auth_token');
fetch('http://localhost:8000/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Utilisateurs:', data));
```

## Vérifications importantes

### 1. Vérifier les rôles dans la base de données

Assurez-vous que la table `roles` contient les rôles nécessaires :

```sql
SELECT * FROM roles;
```

Résultat attendu :
- id_role: 1, nom_role: 'Étudiant' ou 'Student'
- id_role: 2, nom_role: 'Employé' ou 'Employee'
- id_role: 3, nom_role: 'Gérant' ou 'Manager'
- id_role: 4, nom_role: 'Administrateur' ou 'Admin'

### 2. Vérifier les employés

```sql
SELECT e.*, r.nom_role 
FROM employes e 
LEFT JOIN roles r ON e.id_role = r.id_role;
```

### 3. Vérifier les tokens

```sql
SELECT * FROM personal_access_tokens 
WHERE tokenable_type = 'App\\Models\\Employe' 
ORDER BY created_at DESC 
LIMIT 5;
```

## Résolution des problèmes courants

### Erreur 401 - Non authentifié

**Causes possibles** :
1. Token manquant ou invalide
2. Token expiré
3. Token non associé à un utilisateur valide

**Solutions** :
1. Vérifier que le token est bien stocké dans `localStorage.getItem('auth_token')`
2. Se reconnecter pour obtenir un nouveau token
3. Vérifier que le token existe dans la table `personal_access_tokens`

### Erreur 403 - Accès refusé

**Causes possibles** :
1. L'utilisateur n'a pas le bon rôle
2. Le nom du rôle dans la base de données ne correspond pas aux rôles autorisés
3. L'employé est inactif (`actif = 'non'`)

**Solutions** :
1. Vérifier le rôle de l'utilisateur via l'endpoint `/api/diagnostic/auth`
2. Mettre à jour le rôle dans la base de données si nécessaire
3. Activer l'employé : `UPDATE employes SET actif = 'oui' WHERE id_employe = X`

## Routes protégées par rôle

### Routes admin/staff (nécessitent `role:admin,employe`)

- `GET /api/admin/users` - Liste des utilisateurs
- `POST /api/admin/users` - Créer un utilisateur
- `PUT /api/admin/users/{id}` - Modifier un utilisateur
- `DELETE /api/admin/users/{id}` - Supprimer un utilisateur
- `POST /api/admin/users/{id}/toggle-status` - Activer/Désactiver
- Etc.

### Routes publiques (pas de middleware)

- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/staff/login` - Connexion staff
- `GET /api/menu` - Liste des plats

## Configuration Sanctum

Le fichier `config/sanctum.php` est configuré pour gérer les deux guards :

```php
'guard' => ['web', 'employe'],
```

Cela permet à Sanctum d'authentifier à la fois les `User` et les `Employe`.

## Notes importantes

1. **Deux systèmes d'authentification** : 
   - `/api/auth/login` pour les utilisateurs (User)
   - `/api/staff/login` pour les employés (Employe)

2. **Tokens séparés** : Chaque type d'utilisateur a ses propres tokens dans la table `personal_access_tokens`

3. **Middleware flexible** : Le middleware `CheckRole` accepte maintenant plusieurs variantes de noms de rôles

## Prochaines étapes recommandées

1. ✅ Tester l'authentification staff
2. ✅ Vérifier l'accès aux routes admin
3. ⚠️ Standardiser les noms de rôles dans la base de données (recommandé)
4. ⚠️ Ajouter des logs pour faciliter le debugging
5. ⚠️ Créer des tests automatisés pour les permissions
