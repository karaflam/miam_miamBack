# Diagnostic - Token incorrect

## Problème

Même après avoir nettoyé localStorage, le token pointe toujours vers Marc Fangue (User).

## Vérifications à faire

### 1. Vérifier le localStorage MAINTENANT

Ouvrez la console (F12) et tapez:

```javascript
console.log('Token:', localStorage.getItem('auth_token'))
console.log('User:', localStorage.getItem('currentUser'))
```

**Question**: Que voyez-vous?
- Si vous voyez Marc Fangue → Le token n'a pas été remplacé
- Si vous voyez Bernard Pierre → Le token est bon mais le backend a un problème

### 2. Supprimer MANUELLEMENT le token

Dans la console:

```javascript
// Supprimer le token
localStorage.removeItem('auth_token')
localStorage.removeItem('currentUser')

// Vérifier que c'est vide
console.log('Après suppression:', localStorage.getItem('auth_token'))
// Doit afficher: null
```

### 3. Se reconnecter MANUELLEMENT via l'API

Dans la console:

```javascript
// D'abord, obtenir le cookie CSRF
fetch('/sanctum/csrf-cookie')
  .then(() => {
    // Puis se connecter
    return fetch('/api/staff/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0]
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password'
      })
    })
  })
  .then(r => r.json())
  .then(data => {
    console.log('Réponse login:', data)
    if (data.success) {
      // Stocker le nouveau token
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      console.log('Token stocké:', data.token)
      console.log('User stocké:', data.user)
      
      // Recharger la page
      window.location.href = '/profile'
    }
  })
```

### 4. Vérifier la base de données

Exécutez cette requête SQL:

```sql
-- Voir les derniers tokens
SELECT 
    id,
    tokenable_type,
    tokenable_id,
    name,
    LEFT(token, 20) as token_debut,
    created_at
FROM personal_access_tokens
ORDER BY created_at DESC
LIMIT 5;

-- Voir les employés
SELECT id_employe, nom, prenom, email FROM employes;
```

**Question**: Quel est le `tokenable_type` du dernier token?
- Si c'est `App\Models\User` → Le token n'a pas été recréé
- Si c'est `App\Models\Employe` → Le token est bon mais pas stocké dans localStorage

## Solution selon le diagnostic

### Si localStorage contient toujours Marc Fangue

Le problème est dans le frontend. Le token n'est pas remplacé lors de la connexion.

**Solution**: Utilisez le script de l'étape 3 ci-dessus.

### Si la BDD montre un token User

Le problème est que la connexion staff ne crée pas de nouveau token.

**Solution**: Vérifier que vous utilisez bien `/staff-login` et pas `/student-login`.

### Si tout semble correct mais ça ne marche pas

Il y a peut-être un problème de cache navigateur.

**Solution**: 
1. Ouvrez un onglet de navigation privée
2. Allez sur `http://localhost:8000/staff-login`
3. Connectez-vous avec `admin@test.com` / `password`
4. Allez sur `/profile`

## Test rapide

Essayez cette commande dans la console:

```javascript
// Voir TOUS les items dans localStorage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  console.log(key + ':', localStorage.getItem(key))
}
```

Partagez-moi le résultat!
