# Guide de test - Authentification et permissions Staff

## Prérequis

1. Base de données configurée et migrée
2. Seeders exécutés pour créer les rôles et employés de test

## Étape 1 : Vérifier les données de test

### Exécuter les seeders

```bash
cd miam_miam
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=EmployeSeeder
```

### Vérifier les rôles créés

```sql
SELECT * FROM roles;
```

Résultat attendu :
```
id_role | nom_role       | description
--------|----------------|------------------------------------------
1       | etudiant       | Utilisateur étudiant - passe des commandes
2       | employe        | Employé du restaurant - valide commandes et gère menu
3       | gerant         | Gérant - supervise et crée des employés
4       | administrateur | Administrateur - accès complet à toutes les fonctionnalités
```

### Vérifier les employés de test

```sql
SELECT e.id_employe, e.nom, e.prenom, e.email, e.actif, r.nom_role 
FROM employes e 
LEFT JOIN roles r ON e.id_role = r.id_role;
```

Comptes de test disponibles :
- **Employé** : `employee@test.com` / `password`
- **Manager** : `manager@test.com` / `password`
- **Admin** : `admin@test.com` / `password`

## Étape 2 : Tester l'authentification Staff

### Test 1 : Connexion Admin

**Requête** :
```bash
curl -X POST http://localhost:8000/api/staff/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "user": {
    "id": 3,
    "name": "Bernard Pierre",
    "email": "admin@test.com",
    "role": "admin",
    "telephone": "0123456791",
    "date_embauche": "2024-..."
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxx"
}
```

**Copier le token** pour les tests suivants.

### Test 2 : Diagnostic d'authentification

Remplacez `YOUR_TOKEN` par le token obtenu :

```bash
curl -X GET http://localhost:8000/api/diagnostic/auth \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Diagnostic de l'authentification",
  "diagnostic": {
    "authenticated": true,
    "user_class": "App\\Models\\Employe",
    "user_id": 3,
    "user_email": "admin@test.com",
    "user_name": "Bernard Pierre",
    "actif": "oui",
    "id_role": 4,
    "role_info": {
      "id": 4,
      "nom_role": "administrateur",
      "nom_role_lowercase": "administrateur",
      "description": "Administrateur - accès complet à toutes les fonctionnalités"
    }
  }
}
```

✅ **Si vous obtenez cette réponse, l'authentification fonctionne correctement !**

## Étape 3 : Tester l'accès aux routes admin

### Test 3 : Liste des utilisateurs

```bash
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": [
    {
      "id": "user_1",
      "nom": "...",
      "prenom": "...",
      "email": "...",
      "role": "student",
      "type": "user"
    },
    {
      "id": "employe_1",
      "nom": "...",
      "prenom": "...",
      "email": "...",
      "role": "employee",
      "type": "employe"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 2
  }
}
```

✅ **Si vous obtenez cette réponse, les permissions fonctionnent correctement !**

## Étape 4 : Test depuis le frontend

### Ouvrir la console du navigateur

1. Ouvrir http://localhost:8000 (ou votre URL frontend)
2. Se connecter avec `admin@test.com` / `password`
3. Ouvrir la console développeur (F12)

### Test JavaScript

```javascript
// 1. Vérifier le token
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? 'Présent ✓' : 'Absent ✗');

// 2. Vérifier l'utilisateur actuel
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
console.log('Utilisateur:', currentUser);

// 3. Test diagnostic
fetch('http://localhost:8000/api/diagnostic/auth', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Diagnostic:', data);
  if (data.success) {
    console.log('✓ Authentification OK');
    console.log('✓ Rôle:', data.diagnostic.role_info?.nom_role);
  }
})
.catch(err => console.error('✗ Erreur:', err));

// 4. Test accès admin
fetch('http://localhost:8000/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => {
  if (data.success) {
    console.log('✅ Accès admin OK');
    console.log('✓ Nombre d\'utilisateurs:', data.data?.length || 0);
  } else {
    console.error('✗ Accès refusé:', data.message);
  }
})
.catch(err => console.error('✗ Erreur:', err));
```

## Étape 5 : Résolution des problèmes

### Erreur 401 - Non authentifié

**Symptôme** : `{"success": false, "message": "Non authentifié"}`

**Vérifications** :
1. Le token est-il présent dans le header `Authorization: Bearer ...` ?
2. Le token existe-t-il dans la base de données ?

```sql
SELECT * FROM personal_access_tokens 
WHERE tokenable_type = 'App\\Models\\Employe' 
ORDER BY created_at DESC 
LIMIT 5;
```

3. Le token est-il expiré ?

**Solution** : Se reconnecter pour obtenir un nouveau token.

### Erreur 403 - Accès refusé

**Symptôme** : `{"success": false, "message": "Accès non autorisé. Permissions insuffisantes."}`

**Vérifications** :
1. Vérifier le rôle de l'utilisateur via `/api/diagnostic/auth`
2. Vérifier que l'employé est actif :

```sql
SELECT id_employe, nom, prenom, email, actif, id_role 
FROM employes 
WHERE email = 'admin@test.com';
```

3. Vérifier le rôle associé :

```sql
SELECT e.email, e.actif, r.nom_role 
FROM employes e 
LEFT JOIN roles r ON e.id_role = r.id_role 
WHERE e.email = 'admin@test.com';
```

**Solutions** :
- Si `actif = 'non'` : `UPDATE employes SET actif = 'oui' WHERE email = 'admin@test.com';`
- Si le rôle est incorrect : Vérifier que le middleware accepte ce rôle
- Si pas de rôle : Assigner un rôle à l'employé

### Erreur CORS

**Symptôme** : Erreur dans la console du navigateur concernant CORS

**Vérification** :
```bash
cat miam_miam/config/cors.php
```

**Solution** : Vérifier que `localhost:8000` et votre domaine frontend sont dans `allowed_origins`.

## Étape 6 : Tests avec différents rôles

### Test avec Employé (role: employe)

```bash
# 1. Se connecter
curl -X POST http://localhost:8000/api/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email": "employee@test.com", "password": "password"}'

# 2. Tester l'accès admin (devrait fonctionner car employe est autorisé)
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer TOKEN_EMPLOYE" \
  -H "Accept: application/json"
```

**Résultat attendu** : ✅ Accès autorisé (200 OK)

### Test avec Manager (role: gerant)

```bash
# 1. Se connecter
curl -X POST http://localhost:8000/api/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@test.com", "password": "password"}'

# 2. Tester l'accès admin
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer TOKEN_MANAGER" \
  -H "Accept: application/json"
```

**Résultat attendu** : ✅ Accès autorisé (200 OK) car "gerant" est dans les correspondances de "employe"

## Résumé des corrections

### Fichiers modifiés

1. **`app/Http/Middleware/CheckRole.php`**
   - Ajout de correspondances flexibles pour les rôles
   - Support des deux types d'utilisateurs (User et Employe)

2. **`routes/api.php`**
   - Ajout de la route `/api/diagnostic/auth`

### Fichiers créés

1. **`app/Http/Controllers/Api/DiagnosticController.php`**
   - Endpoint de diagnostic pour l'authentification

2. **`CORRECTION_ERREURS_401_403.md`**
   - Documentation complète des corrections

3. **`GUIDE_TEST_AUTHENTIFICATION.md`**
   - Guide de test (ce fichier)

## Commandes utiles

```bash
# Réinitialiser la base de données et les seeders
php artisan migrate:fresh --seed

# Exécuter uniquement les seeders de rôles et employés
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=EmployeSeeder

# Vider le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Voir toutes les routes
php artisan route:list --path=admin

# Voir les logs
tail -f storage/logs/laravel.log
```
