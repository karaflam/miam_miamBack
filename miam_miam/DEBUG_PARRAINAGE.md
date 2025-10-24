# 🐛 Guide de débogage - Section Parrainage

## Problème : Page blanche après le loader

### ✅ Corrections apportées

1. **Structure HTML corrigée** - L'indentation du bloc de code de parrainage était incorrecte
2. **Gestion d'erreur ajoutée** - Affichage d'un message si l'API échoue
3. **Logs de débogage** - Console.log pour voir ce que retourne l'API

### 🔍 Comment déboguer

#### 1. Ouvrir la console du navigateur
- **Chrome/Edge**: F12 ou Ctrl+Shift+I
- **Firefox**: F12 ou Ctrl+Shift+K
- Aller dans l'onglet "Console"

#### 2. Reproduire le problème
1. Connectez-vous à l'application
2. Allez dans "Espace Étudiant"
3. Cliquez sur l'onglet "Parrainage"
4. Regardez la console

#### 3. Vérifier les logs

**Si vous voyez :**
```
Erreur code: ...
Erreur filleuls: ...
```
→ L'API retourne une erreur

**Si vous voyez :**
```
Erreur chargement parrainage: ...
```
→ L'appel API a échoué complètement

#### 4. Tester l'API directement

**Ouvrir un terminal et tester :**

```bash
# Récupérer votre token
# 1. Connectez-vous sur l'application
# 2. Ouvrez la console
# 3. Tapez: localStorage.getItem('auth_token')
# 4. Copiez le token

# Tester l'API du code
curl -X GET http://127.0.0.1:8000/api/referral/code \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Accept: application/json"

# Tester l'API des filleuls
curl -X GET http://127.0.0.1:8000/api/referral/referrals \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Accept: application/json"
```

### 🔧 Solutions possibles

#### Erreur 401 (Unauthorized)
**Cause:** Token invalide ou expiré  
**Solution:**
1. Déconnectez-vous
2. Reconnectez-vous
3. Réessayez

#### Erreur 500 (Internal Server Error)
**Cause:** Erreur côté serveur Laravel  
**Solution:**
1. Vérifiez les logs Laravel: `storage/logs/laravel.log`
2. Vérifiez que la table `users` a bien la colonne `code_parrainage`
3. Vérifiez que la table `users` a bien la colonne `id_parrain`

#### Erreur 404 (Not Found)
**Cause:** Route API non trouvée  
**Solution:**
1. Vérifiez que les routes sont bien dans `routes/api.php`
2. Videz le cache: `php artisan route:clear`
3. Listez les routes: `php artisan route:list | grep referral`

#### Code vide ou null
**Cause:** L'utilisateur n'a pas de code de parrainage  
**Solution:**
1. Vérifiez dans la base de données:
```sql
SELECT id_utilisateur, code_parrainage FROM users WHERE email = 'votre@email.com';
```
2. Si le code est NULL, générez-en un:
```sql
UPDATE users SET code_parrainage = 'ABC12345' WHERE email = 'votre@email.com';
```

### 📊 Vérifications dans la base de données

```sql
-- Vérifier la structure de la table users
DESCRIBE users;

-- Vérifier que le code_parrainage existe
SELECT id_utilisateur, nom, prenom, code_parrainage, id_parrain 
FROM users 
LIMIT 5;

-- Compter les filleuls d'un utilisateur
SELECT COUNT(*) as nb_filleuls 
FROM users 
WHERE id_parrain = 1; -- Remplacez 1 par votre id_utilisateur

-- Voir les filleuls d'un utilisateur
SELECT id_utilisateur, nom, prenom, email, date_creation
FROM users 
WHERE id_parrain = 1; -- Remplacez 1 par votre id_utilisateur
```

### 🎯 Checklist de vérification

- [ ] Les routes API sont bien définies dans `routes/api.php`
- [ ] Le contrôleur `ReferralController` existe
- [ ] La table `users` a la colonne `code_parrainage`
- [ ] La table `users` a la colonne `id_parrain`
- [ ] L'utilisateur connecté a un `code_parrainage` non NULL
- [ ] Le token d'authentification est valide
- [ ] Les logs Laravel ne montrent pas d'erreur
- [ ] La console du navigateur ne montre pas d'erreur

### 🚀 Test rapide

**Dans la console du navigateur (F12) :**

```javascript
// Vérifier le token
console.log('Token:', localStorage.getItem('auth_token'))

// Vérifier l'utilisateur
console.log('User:', JSON.parse(localStorage.getItem('currentUser')))

// Tester l'API manuellement
fetch('/api/referral/code', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Code API:', data))
.catch(err => console.error('Erreur:', err))

fetch('/api/referral/referrals', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Filleuls API:', data))
.catch(err => console.error('Erreur:', err))
```

### 📝 Logs utiles

**Backend (Laravel):**
```bash
# Voir les logs en temps réel
tail -f storage/logs/laravel.log

# Sous Windows (PowerShell)
Get-Content storage/logs/laravel.log -Tail 50 -Wait
```

**Frontend (React):**
- Ouvrez la console du navigateur (F12)
- Onglet "Console" pour les logs
- Onglet "Network" pour voir les requêtes HTTP
- Filtrez par "referral" pour voir uniquement les appels API de parrainage

### 🔄 Si rien ne fonctionne

1. **Videz tous les caches:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

2. **Redémarrez le serveur:**
```bash
# Arrêtez le serveur (Ctrl+C)
php artisan serve
```

3. **Videz le cache du navigateur:**
- Chrome: Ctrl+Shift+Delete
- Cochez "Images et fichiers en cache"
- Cliquez sur "Effacer les données"

4. **Reconnectez-vous:**
- Déconnexion
- Connexion
- Réessayez

---

**Si le problème persiste, envoyez-moi :**
1. Les logs de la console du navigateur
2. Les logs Laravel (`storage/logs/laravel.log`)
3. Le résultat des commandes curl ci-dessus
