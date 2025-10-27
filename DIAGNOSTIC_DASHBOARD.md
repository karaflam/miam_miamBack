# 🔍 Diagnostic Dashboard - Problèmes identifiés

## ❌ Problèmes signalés

1. **Nombre d'utilisateurs incorrect** : Affiche 3 au lieu de 7
2. **Graphique de répartition ne s'affiche plus**

---

## 🔧 Corrections apportées

### 1. Comptage des utilisateurs par rôle

**Problème :** Les rôles dans la base de données peuvent avoir des noms différents :
- `etudiant` vs `student`
- `employe` vs `employee`

**Solution appliquée :**
```php
// Avant
$etudiants = User::where('role', 'etudiant')->count();
$employes = User::where('role', 'employe')->count();

// Après
$etudiants = User::whereIn('role', ['etudiant', 'student'])->count();
$employes = User::whereIn('role', ['employe', 'employee'])->count();
$total = User::count(); // Total réel de TOUS les utilisateurs
```

### 2. Logs de débogage ajoutés

**Dans le frontend :**
```javascript
console.log('📊 Répartition utilisateurs:', repartition);
console.log('📊 Données graphique:', chartData);
```

---

## 🧪 Tests à effectuer

### Test 1 : Vérifier les rôles dans la base de données

```sql
-- Voir tous les rôles existants
SELECT role, COUNT(*) as nombre
FROM users
GROUP BY role;
```

**Résultat attendu :**
```
role        | nombre
------------|-------
student     | 5
admin       | 1
manager     | 1
```

### Test 2 : Tester l'API directement

```bash
curl -X GET http://localhost:8000/api/admin/dashboard/repartition-utilisateurs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "etudiants": { "count": 5, "percentage": 71.4 },
    "employes": { "count": 0, "percentage": 0 },
    "managers": { "count": 1, "percentage": 14.3 },
    "admins": { "count": 1, "percentage": 14.3 },
    "total": 7
  }
}
```

### Test 3 : Vérifier les logs dans la console

1. Ouvrir le dashboard admin
2. Ouvrir la console (F12)
3. Chercher les messages :
   ```
   ✅ Données dashboard récupérées: {...}
   📊 Répartition utilisateurs: {...}
   📊 Données graphique: [5, 0, 1, 1]
   ```

---

## 🐛 Causes possibles

### Cause 1 : Noms de rôles différents

**Vérification :**
```sql
SELECT DISTINCT role FROM users;
```

**Solutions selon le résultat :**

**Si vous voyez `student` :**
```php
// Déjà corrigé dans DashboardController
$etudiants = User::whereIn('role', ['etudiant', 'student'])->count();
```

**Si vous voyez d'autres noms :**
Ajoutez-les dans le `whereIn()` :
```php
$etudiants = User::whereIn('role', ['etudiant', 'student', 'eleve'])->count();
```

### Cause 2 : Graphique ne se crée pas

**Vérifications dans la console :**

**Message 1 :** `⚠️ Aucune donnée pour le graphique de répartition`
- **Cause :** Tous les compteurs sont à 0
- **Solution :** Vérifier la requête SQL et les noms de rôles

**Message 2 :** `⚠️ Graphique répartition: ref ou données manquantes`
- **Cause :** Le canvas n'existe pas ou les données ne sont pas chargées
- **Solution :** Vérifier que le dashboard est bien sur l'onglet "dashboard"

### Cause 3 : Total incorrect

**Problème :** Le total ne correspond pas à la somme des rôles

**Vérification :**
```sql
-- Compter TOUS les utilisateurs
SELECT COUNT(*) as total FROM users;

-- Compter par rôle
SELECT role, COUNT(*) as nombre FROM users GROUP BY role;
```

**Si les totaux ne correspondent pas :**
- Il y a des utilisateurs avec des rôles non comptabilisés
- Solution : Ajouter ces rôles dans le controller

---

## 📋 Checklist de diagnostic

### Étape 1 : Vérifier la base de données

```sql
-- 1. Compter tous les utilisateurs
SELECT COUNT(*) FROM users;
-- Résultat attendu : 7

-- 2. Voir les rôles
SELECT role, COUNT(*) FROM users GROUP BY role;
-- Vérifier les noms exacts des rôles

-- 3. Vérifier les utilisateurs
SELECT id, nom, prenom, email, role FROM users;
```

### Étape 2 : Tester l'API

```bash
# Récupérer le token
# Dans la console du navigateur :
localStorage.getItem('auth_token')

# Tester l'endpoint
curl -X GET http://localhost:8000/api/admin/dashboard/all \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Accept: application/json" | jq
```

### Étape 3 : Vérifier les logs Laravel

```bash
# Voir les logs en temps réel
tail -f storage/logs/laravel.log
```

### Étape 4 : Vérifier la console du navigateur

1. Ouvrir le dashboard
2. F12 → Console
3. Chercher :
   - ✅ `Données dashboard récupérées`
   - 📊 `Répartition utilisateurs`
   - 📊 `Données graphique`
   - ⚠️ Messages d'avertissement

---

## 🔧 Solutions rapides

### Solution 1 : Forcer le rafraîchissement

```javascript
// Dans la console du navigateur
localStorage.removeItem('dashboardData');
location.reload();
```

### Solution 2 : Vider le cache du navigateur

1. F12 → Network
2. Clic droit → Clear browser cache
3. Rafraîchir la page (Ctrl+F5)

### Solution 3 : Vérifier les middlewares

```php
// Dans routes/api.php
Route::middleware('role:admin,manager')->prefix('admin/dashboard')->group(function () {
    // Vérifier que cette route existe
    Route::get('/all', [DashboardController::class, 'all']);
});
```

---

## 📊 Exemple de réponse correcte

**API `/api/admin/dashboard/all` :**

```json
{
  "success": true,
  "data": {
    "stats": {
      "utilisateurs_totaux": {
        "total": 7,
        "variation": 0,
        "label": "+0% ce mois"
      },
      "chiffre_affaire_total": {
        "total": 0,
        "variation": 0,
        "label": "+0% ce mois"
      },
      "commandes_totales": {
        "total": 0,
        "variation": 0,
        "label": "+0% ce mois"
      },
      "plats_actifs": {
        "total": 24,
        "statut": "Stable"
      }
    },
    "performance_globale": [
      { "mois": "Mai", "chiffre_affaire": 0, "commandes": 0 },
      { "mois": "Juin", "chiffre_affaire": 0, "commandes": 0 },
      { "mois": "Juil", "chiffre_affaire": 0, "commandes": 0 },
      { "mois": "Août", "chiffre_affaire": 0, "commandes": 0 },
      { "mois": "Sep", "chiffre_affaire": 0, "commandes": 0 },
      { "mois": "Oct", "chiffre_affaire": 0, "commandes": 0 }
    ],
    "repartition_utilisateurs": {
      "etudiants": { "count": 5, "percentage": 71.4 },
      "employes": { "count": 0, "percentage": 0.0 },
      "managers": { "count": 1, "percentage": 14.3 },
      "admins": { "count": 1, "percentage": 14.3 },
      "total": 7
    }
  }
}
```

---

## 🎯 Prochaines étapes

1. **Exécuter la requête SQL** pour voir les rôles réels
2. **Tester l'API** avec curl
3. **Vérifier les logs** dans la console
4. **Me communiquer les résultats** pour un diagnostic plus précis

---

## 📝 Informations à me fournir

Pour vous aider davantage, j'ai besoin de :

1. **Résultat de la requête SQL :**
   ```sql
   SELECT role, COUNT(*) FROM users GROUP BY role;
   ```

2. **Réponse de l'API :**
   ```bash
   curl http://localhost:8000/api/admin/dashboard/all -H "Authorization: Bearer TOKEN"
   ```

3. **Messages dans la console du navigateur :**
   - Copier tous les messages qui commencent par 📊 ou ⚠️

4. **Capture d'écran du dashboard** (si possible)

---

## ✅ Vérifications finales

- [ ] Requête SQL exécutée
- [ ] Noms des rôles identifiés
- [ ] API testée avec curl
- [ ] Logs de la console vérifiés
- [ ] Graphique s'affiche correctement
- [ ] Total utilisateurs correct (7)

**Une fois ces vérifications faites, le problème devrait être résolu ! 🎉**
