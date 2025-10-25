# 🔧 Corrections des erreurs 401/403 - Authentification Staff

## 📋 Résumé

Ce document récapitule les corrections apportées pour résoudre les erreurs d'authentification et d'autorisation (401/403) lors de l'accès aux espaces staff de l'application Miam Miam.

## 🎯 Problème initial

Lors de l'accès au tableau de bord admin (`AdminDashboard`), les utilisateurs staff rencontraient :
- **Erreur 401** : "Non authentifié"
- **Erreur 403** : "Accès refusé. Vous n'avez pas les permissions nécessaires"

## 🔍 Cause identifiée

Le middleware `CheckRole` ne gérait pas correctement :
1. Les correspondances entre les noms de rôles en base de données (`administrateur`, `employe`, `gerant`) et les rôles demandés par les routes (`admin`, `employe`)
2. La distinction entre les deux types d'utilisateurs (`User` et `Employe`)

## ✅ Solutions appliquées

### 1. Middleware CheckRole amélioré

**Fichier** : `app/Http/Middleware/CheckRole.php`

**Améliorations** :
- ✅ Système de correspondance flexible des rôles
- ✅ Support des variantes français/anglais
- ✅ Gestion des deux types d'utilisateurs (User et Employe)
- ✅ Meilleure lisibilité et maintenabilité du code

### 2. Endpoint de diagnostic

**Fichier** : `app/Http/Controllers/Api/DiagnosticController.php`  
**Route** : `GET /api/diagnostic/auth`

Permet de diagnostiquer rapidement les problèmes d'authentification.

### 3. Documentation complète

Trois documents créés :
- `CORRECTION_ERREURS_401_403.md` - Documentation technique détaillée
- `GUIDE_TEST_AUTHENTIFICATION.md` - Guide de test pas à pas
- `README_CORRECTIONS_AUTH.md` - Ce fichier récapitulatif

### 4. Scripts de test

- `test_auth.ps1` - Script PowerShell pour tester automatiquement l'authentification
- `VERIFIER_TOKENS_STAFF.sql` - Requêtes SQL pour vérifier les tokens et les rôles

## 🚀 Démarrage rapide

### Étape 1 : Vérifier les données de test

```bash
cd miam_miam
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=EmployeSeeder
```

### Étape 2 : Tester l'authentification

**Option A - Via PowerShell** :
```powershell
.\test_auth.ps1
```

**Option B - Via cURL** :
```bash
# Connexion
curl -X POST http://localhost:8000/api/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password"}'

# Copier le token et tester
curl -X GET http://localhost:8000/api/diagnostic/auth \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Option C - Via le navigateur** :
1. Se connecter sur http://localhost:8000
2. Ouvrir la console (F12)
3. Coller le code de test JavaScript du guide

### Étape 3 : Vérifier les résultats

✅ **Succès** : Vous devriez voir :
- Connexion réussie avec un token
- Diagnostic montrant votre rôle
- Accès à la liste des utilisateurs

❌ **Échec** : Consultez le guide de dépannage dans `GUIDE_TEST_AUTHENTIFICATION.md`

## 📁 Fichiers modifiés/créés

### Fichiers modifiés
- ✏️ `app/Http/Middleware/CheckRole.php` - Logique de vérification des rôles
- ✏️ `routes/api.php` - Ajout de la route de diagnostic

### Fichiers créés
- ➕ `app/Http/Controllers/Api/DiagnosticController.php` - Contrôleur de diagnostic
- ➕ `CORRECTION_ERREURS_401_403.md` - Documentation technique
- ➕ `GUIDE_TEST_AUTHENTIFICATION.md` - Guide de test
- ➕ `test_auth.ps1` - Script de test PowerShell
- ➕ `VERIFIER_TOKENS_STAFF.sql` - Requêtes SQL de vérification
- ➕ `README_CORRECTIONS_AUTH.md` - Ce fichier

## 🔑 Comptes de test

Après avoir exécuté les seeders, vous disposez de :

| Email | Mot de passe | Rôle | Accès admin |
|-------|--------------|------|-------------|
| `admin@test.com` | `password` | Administrateur | ✅ Oui |
| `manager@test.com` | `password` | Gérant | ✅ Oui |
| `employee@test.com` | `password` | Employé | ✅ Oui |

## 🎨 Correspondances des rôles

Le middleware accepte maintenant ces correspondances :

| Rôle demandé | Rôles acceptés en base de données |
|--------------|-----------------------------------|
| `admin` | admin, administrateur, administrator |
| `employe` | employe, employé, employee, staff, gerant, gestionnaire, manager |
| `manager` | gerant, gestionnaire, manager |
| `student` | student, etudiant, utilisateur |

## 🐛 Dépannage rapide

### Erreur 401
```bash
# Vérifier le token
SELECT * FROM personal_access_tokens 
WHERE tokenable_type = 'App\Models\Employe' 
ORDER BY created_at DESC LIMIT 5;
```

### Erreur 403
```bash
# Vérifier le rôle
SELECT e.email, e.actif, r.nom_role 
FROM employes e 
LEFT JOIN roles r ON e.id_role = r.id_role 
WHERE e.email = 'admin@test.com';
```

### Employé inactif
```sql
UPDATE employes SET actif = 'oui' WHERE email = 'admin@test.com';
```

## 📚 Documentation complète

Pour plus de détails, consultez :

1. **`CORRECTION_ERREURS_401_403.md`** - Explication technique complète
2. **`GUIDE_TEST_AUTHENTIFICATION.md`** - Guide de test détaillé avec exemples
3. **`VERIFIER_TOKENS_STAFF.sql`** - Requêtes SQL pour diagnostic

## ✨ Améliorations futures recommandées

- [ ] Standardiser les noms de rôles en base de données (tout en minuscules)
- [ ] Ajouter des logs détaillés dans le middleware pour faciliter le debugging
- [ ] Créer des tests automatisés (PHPUnit) pour les permissions
- [ ] Implémenter un système de rafraîchissement automatique des tokens
- [ ] Ajouter une interface admin pour gérer les rôles et permissions

## 🤝 Support

Si vous rencontrez toujours des problèmes après avoir suivi ce guide :

1. Exécutez le script de diagnostic : `.\test_auth.ps1`
2. Vérifiez les logs Laravel : `storage/logs/laravel.log`
3. Consultez la console du navigateur (F12)
4. Vérifiez les tokens en base de données avec `VERIFIER_TOKENS_STAFF.sql`

## 📝 Notes importantes

- ⚠️ Les tokens Sanctum n'expirent pas par défaut (configurable dans `config/sanctum.php`)
- ⚠️ Un employé doit avoir `actif = 'oui'` pour se connecter
- ⚠️ Un employé doit avoir un rôle valide dans la table `roles`
- ⚠️ Les routes `/api/admin/*` nécessitent le middleware `role:admin,employe`

## ✅ Checklist de vérification

Avant de signaler un problème, vérifiez :

- [ ] Les seeders ont été exécutés (`RoleSeeder` et `EmployeSeeder`)
- [ ] L'employé existe et est actif en base de données
- [ ] L'employé a un rôle valide
- [ ] Le token est bien envoyé dans le header `Authorization: Bearer ...`
- [ ] Le serveur Laravel est démarré (`php artisan serve`)
- [ ] La configuration CORS autorise votre domaine frontend

---

**Date de création** : 2024  
**Dernière mise à jour** : 2024  
**Version** : 1.0
