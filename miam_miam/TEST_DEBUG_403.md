# Guide de test et debug - Erreur 403

## Étape 1 : Vérifier le rôle exact dans la base de données

**Exécuter ce SQL :**
```sql
SELECT id_role, nom_role, description FROM zeduc_schema.roles ORDER BY id_role;
```

**Résultat attendu :**
```
id_role | nom_role       | description
--------|----------------|------------------
1       | Étudiant       | ...
2       | Employé        | ...
3       | Gérant         | ...
4       | Administrateur | ...
```

## Étape 2 : Vérifier l'utilisateur manager connecté

**Exécuter ce SQL :**
```sql
SELECT 
    e.id_employe,
    e.email,
    e.nom,
    e.prenom,
    r.id_role,
    r.nom_role,
    e.actif
FROM zeduc_schema.employes e
LEFT JOIN zeduc_schema.roles r ON e.id_role = r.id_role
WHERE e.email = 'VOTRE_EMAIL_MANAGER@example.com';
```

## Étape 3 : Tester la route de debug

**Dans la console du navigateur (F12) :**
```javascript
fetch('http://localhost:8000/api/debug/whoami', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => {
  console.log('=== INFORMATIONS UTILISATEUR ===');
  console.log('Type:', d.user_type);
  console.log('Email:', d.user_data.email);
  console.log('Rôle ID:', d.role?.id_role);
  console.log('Rôle nom:', d.role?.nom_role);
  console.log('Rôle lowercase:', d.role?.nom_role_lowercase);
  console.log('================================');
});
```

**Résultat attendu :**
```json
{
  "success": true,
  "user_type": "App\\Models\\Employe",
  "user_data": {
    "id": 1,
    "nom": "Doe",
    "prenom": "John",
    "email": "john@example.com"
  },
  "role": {
    "id_role": 3,
    "nom_role": "Gérant",
    "nom_role_lowercase": "gérant"
  }
}
```

## Étape 4 : Vérifier les logs Laravel

**Terminal :**
```bash
# Effacer les anciens logs
echo "" > storage/logs/laravel.log

# Suivre les logs en temps réel
tail -f storage/logs/laravel.log
```

**Puis dans le navigateur, essayer de modifier un article du menu.**

**Logs attendus :**
```
[2024-XX-XX XX:XX:XX] local.INFO: CheckRole - Vérification: 
{
  "nom_role": "gérant",
  "nom_role_original": "Gérant",
  "roles_autorises": ["admin","employe","manager"],
  "user_email": "john@example.com"
}

[2024-XX-XX XX:XX:XX] local.INFO: CheckRole - Accès autorisé (via correspondances) 
{
  "roleAutorise": "manager"
}
```

## Étape 5 : Test manuel des routes

### Test 1 : Récupérer les utilisateurs
```javascript
fetch('http://localhost:8000/api/admin/users', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Utilisateurs:', d));
```

### Test 2 : Modifier un article du menu
```javascript
fetch('http://localhost:8000/api/menu/1', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nom_article: 'Test modifié',
    prix: 2500,
    disponible: 'oui'
  })
})
.then(r => r.json())
.then(d => console.log('Résultat:', d))
.catch(e => console.error('Erreur:', e));
```

### Test 3 : Toggle disponibilité
```javascript
fetch('http://localhost:8000/api/menu/1/toggle-disponibilite', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Toggle:', d));
```

## Étape 6 : Analyser l'erreur 403

Si vous obtenez toujours une erreur 403, vérifiez la réponse :

```javascript
fetch('http://localhost:8000/api/menu/1', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ nom_article: 'Test' })
})
.then(async r => {
  const data = await r.json();
  console.log('Status:', r.status);
  console.log('Response:', data);
  if (data.debug) {
    console.log('=== DEBUG INFO ===');
    console.log('User type:', data.debug.user_type);
    console.log('Role:', data.debug.role);
    console.log('Required roles:', data.debug.required_roles);
  }
});
```

## Solutions selon le problème identifié

### Problème 1 : Le rôle dans la DB est différent

**Si le rôle est "Gérant" mais pas reconnu :**

Ajouter dans `CheckRole.php` ligne 52 :
```php
'manager' => ['manager', 'gerant', 'gérant', 'gestionnaire', 'responsable', 'LE_NOM_EXACT_ICI'],
```

### Problème 2 : L'utilisateur n'a pas de rôle

**Assigner un rôle :**
```sql
UPDATE zeduc_schema.employes 
SET id_role = 3  -- ID du rôle Gérant
WHERE email = 'votre.email@example.com';
```

### Problème 3 : Le token est invalide

**Se reconnecter :**
1. Déconnexion
2. Reconnexion
3. Vérifier le nouveau token : `localStorage.getItem('auth_token')`

### Problème 4 : Le cache Laravel

**Effacer les caches :**
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

## Résultat final attendu

✅ La route `/api/debug/whoami` retourne le rôle correct
✅ Les logs montrent "Accès autorisé"
✅ Les requêtes vers `/api/menu/*` et `/api/admin/users/*` retournent 200
✅ Le manager peut créer/modifier/supprimer des articles et utilisateurs
