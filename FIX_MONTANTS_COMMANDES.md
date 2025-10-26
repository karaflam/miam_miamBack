# 🔧 Fix : Montants des commandes affichent 0.00 FCFA

## Problème identifié

Les commandes affichent **Montant total: 0.00 FCFA** et **Montant payé: 0.00 FCFA** au lieu des vrais montants.

### Causes possibles :

1. ❌ La colonne `solde` n'existe pas dans la table `users`
2. ❌ Les commandes existantes ont été créées avant l'ajout du calcul des montants
3. ❌ Le backend échoue silencieusement lors de la création de commande

## Solution étape par étape

### Étape 1 : Ajouter la colonne `solde` à la table `users`

**Migration créée :** `2025_10_26_124647_add_solde_to_users_table.php`

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->decimal('solde', 12, 2)->default(0)->after('point_fidelite');
    });
}
```

**Exécuter la migration :**
```bash
cd miam_miam
php artisan migrate
```

### Étape 2 : Mettre à jour le modèle User

✅ **Déjà fait :**
```php
// app/Models/User.php
protected $fillable = [
    'nom', 'prenom', 'email', 'mot_de_passe', 'telephone',
    'localisation', 'code_parrainage', 'id_parrain', 'point_fidelite', 'solde', 'statut'
];

protected $casts = [
    'point_fidelite' => 'integer',
    'solde' => 'decimal:2',  // ✅ Ajouté
    // ...
];
```

### Étape 3 : Corriger les noms de colonnes dans CommandeController

✅ **Déjà fait :**
- `points_fidelite` → `point_fidelite` (singulier)

### Étape 4 : Donner du solde aux utilisateurs pour tester

**Option A : Via SQL direct**
```sql
UPDATE users SET solde = 50000 WHERE id_utilisateur = 1;
```

**Option B : Via Tinker**
```bash
php artisan tinker
```
```php
$user = App\Models\User::find(1);
$user->solde = 50000;
$user->save();
```

**Option C : Via l'interface de recharge (si elle existe)**

### Étape 5 : Vérifier que les nouvelles commandes calculent les montants

Le `CommandeController::store()` calcule maintenant :
```php
// Calcul du montant total
$montantTotal = 0;
foreach ($request->articles as $article) {
    $montantTotal += $article['prix'] * $article['quantite'];
}

// Calcul de la remise (si points utilisés)
$montantRemise = $pointsUtilises * 100;

// Calcul du montant final
$montantFinal = $montantTotal - $montantRemise;

// Création de la commande avec les montants
Commande::create([
    'montant_total' => $montantTotal,
    'montant_remise' => $montantRemise,
    'montant_final' => $montantFinal,
    'points_utilises' => $pointsUtilises,
    // ...
]);
```

### Étape 6 : Mettre à jour les anciennes commandes (optionnel)

Si vous voulez corriger les commandes existantes qui ont des montants à 0 :

```sql
-- Calculer et mettre à jour les montants pour les commandes existantes
UPDATE commandes c
SET 
    montant_total = (
        SELECT SUM(dc.prix_unitaire * dc.quantite)
        FROM details_commandes dc
        WHERE dc.id_commande = c.id_commande
    ),
    montant_final = (
        SELECT SUM(dc.prix_unitaire * dc.quantite)
        FROM details_commandes dc
        WHERE dc.id_commande = c.id_commande
    )
WHERE montant_total = 0 OR montant_total IS NULL;
```

## Commandes à exécuter MAINTENANT

### 1. Exécuter la migration
```bash
cd miam_miam
php artisan migrate
```

**Résultat attendu :**
```
Migrating: 2025_10_26_124647_add_solde_to_users_table
Migrated:  2025_10_26_124647_add_solde_to_users_table (XX.XXms)
```

### 2. Donner du solde à votre utilisateur de test
```bash
php artisan tinker
```
```php
$user = App\Models\User::find(1);  // Remplacer 1 par votre ID utilisateur
$user->solde = 50000;  // 50 000 FCFA
$user->save();
exit
```

### 3. Nettoyer le cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 4. Redémarrer le serveur Laravel
```bash
php artisan serve
```

### 5. Tester une nouvelle commande

1. Ouvrir le frontend
2. Ajouter des articles au panier
3. **Ouvrir la console (F12)**
4. Passer une commande
5. Vérifier les logs :
   - `Envoi de la commande: {...}`
   - `Réponse du serveur: {...}`

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Commande créée avec succès",
  "data": {
    "id": 10,
    "montant_total": 2500,
    "montant_remise": 0,
    "montant_final": 2500,
    "points_utilises": 0,
    // ...
  }
}
```

## Vérifications après les corrections

### ✅ Vérifier la structure de la table users
```sql
DESCRIBE users;
```
Vous devriez voir la colonne `solde` de type `decimal(12,2)`.

### ✅ Vérifier le solde de l'utilisateur
```sql
SELECT id_utilisateur, nom, prenom, solde, point_fidelite FROM users WHERE id_utilisateur = 1;
```

### ✅ Vérifier les montants des commandes
```sql
SELECT id_commande, montant_total, montant_remise, montant_final, points_utilises 
FROM commandes 
ORDER BY id_commande DESC 
LIMIT 5;
```

### ✅ Vérifier les détails des commandes
```sql
SELECT dc.id_commande, dc.id_article, dc.prix_unitaire, dc.quantite, 
       (dc.prix_unitaire * dc.quantite) as sous_total
FROM details_commandes dc
WHERE dc.id_commande = 9;  -- Remplacer par l'ID de votre commande
```

## Résumé des fichiers modifiés

1. ✅ **Migration créée** : `2025_10_26_124647_add_solde_to_users_table.php`
2. ✅ **User.php** : Ajout de `solde` dans `$fillable` et `$casts`
3. ✅ **CommandeController.php** : 
   - Correction `points_fidelite` → `point_fidelite`
   - Calcul automatique des montants
   - Vérification du solde
4. ✅ **StoreCommandeRequest.php** : Ajout de `points_utilises` dans la validation
5. ✅ **StudentDashboard.jsx** : Interface d'utilisation des points

## Erreur actuelle

```
Points de fidélité insuffisants. Vous avez  points.
```

Cette erreur indique que `$user->point_fidelite` est NULL ou vide. Cela peut arriver si :
1. La colonne `solde` n'existe pas → La transaction échoue
2. L'utilisateur n'a pas de solde → Vérification échoue avant

## Action immédiate

**EXÉCUTEZ CES COMMANDES DANS L'ORDRE :**

```bash
# 1. Aller dans le dossier du projet
cd c:\Users\Fangue\Documents\GitHub\miam_miamBack\miam_miam

# 2. Exécuter la migration
php artisan migrate

# 3. Donner du solde à l'utilisateur
php artisan tinker
```

Puis dans Tinker :
```php
$user = App\Models\User::find(1);
echo "Utilisateur: " . $user->nom . " " . $user->prenom . "\n";
echo "Solde actuel: " . ($user->solde ?? 'NULL') . "\n";
echo "Points actuels: " . ($user->point_fidelite ?? 'NULL') . "\n";

$user->solde = 50000;
$user->point_fidelite = 100;  // Si NULL, donner des points
$user->save();

echo "Nouveau solde: " . $user->solde . "\n";
echo "Nouveaux points: " . $user->point_fidelite . "\n";
exit
```

**Après ces commandes, réessayez de passer une commande !**
