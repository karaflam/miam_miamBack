# Documentation des Tests - MiamMiam Application

## Vue d'ensemble

Cette documentation décrit la suite de tests complète pour l'application MiamMiam, couvrant les tests unitaires, fonctionnels et end-to-end.

## Structure des Tests

```
tests/
├── Unit/                           # Tests unitaires des modèles
│   ├── UserModelTest.php
│   ├── MenuModelTest.php
│   ├── CommandeModelTest.php
│   └── StockModelTest.php
│
└── Feature/                        # Tests fonctionnels et E2E
    ├── AuthenticationTest.php
    ├── CommandeTest.php
    ├── MenuManagementTest.php
    ├── StockManagementTest.php
    ├── LoyaltyPointsTest.php
    └── EndToEndOrderJourneyTest.php
```

## Tests Unitaires

### UserModelTest.php
Tests du modèle User couvrant:
- ✅ Création d'utilisateur
- ✅ Masquage du mot de passe dans les réponses
- ✅ Relations (commandes, parrain, filleuls, suivi points)
- ✅ Casting des types (points de fidélité, solde)

### MenuModelTest.php
Tests du modèle Menu couvrant:
- ✅ Création d'article de menu
- ✅ Relation avec catégorie
- ✅ Relation avec stock
- ✅ Scope pour articles disponibles
- ✅ Casting des types (prix, temps de préparation)

### CommandeModelTest.php
Tests du modèle Commande couvrant:
- ✅ Création de commande
- ✅ Relations (utilisateur, détails, paiements, réclamations)
- ✅ Casting des montants
- ✅ Gestion des points utilisés

### StockModelTest.php
Tests du modèle Stock couvrant:
- ✅ Création de stock
- ✅ Relation avec article
- ✅ Décrémentation du stock
- ✅ Détection de stock faible
- ✅ Détection de rupture de stock

## Tests Fonctionnels

### AuthenticationTest.php
Tests d'authentification couvrant:
- ✅ Inscription avec données valides
- ✅ Inscription avec code de parrainage
- ✅ Échec avec code de parrainage invalide
- ✅ Échec avec email dupliqué
- ✅ Connexion avec identifiants valides
- ✅ Échec de connexion avec identifiants invalides
- ✅ Déconnexion
- ✅ Récupération du profil utilisateur
- ✅ Protection des routes authentifiées
- ✅ Génération de code de parrainage unique

**Total: 12 tests**

### CommandeTest.php
Tests de gestion des commandes couvrant:
- ✅ Création de commande par utilisateur authentifié
- ✅ Décrémentation automatique du stock
- ✅ Échec avec stock insuffisant
- ✅ Échec avec solde insuffisant
- ✅ Création avec utilisation de points de fidélité
- ✅ Gain de points de fidélité sur achat
- ✅ Échec avec points insuffisants
- ✅ Consultation de ses commandes
- ✅ Consultation d'une commande spécifique
- ✅ Impossibilité de voir les commandes d'autres utilisateurs
- ✅ Staff peut voir toutes les commandes
- ✅ Staff peut mettre à jour le statut
- ✅ Protection contre utilisateurs non authentifiés

**Total: 13 tests**

### MenuManagementTest.php
Tests de gestion du menu couvrant:
- ✅ Consultation publique du menu
- ✅ Consultation d'un article spécifique
- ✅ Staff peut créer un article
- ✅ Utilisateur régulier ne peut pas créer d'article
- ✅ Staff peut modifier un article
- ✅ Staff peut supprimer un article
- ✅ Staff peut basculer la disponibilité
- ✅ Consultation publique des catégories

**Total: 8 tests**

### StockManagementTest.php
Tests de gestion du stock couvrant:
- ✅ Staff peut mettre à jour le stock
- ✅ Staff peut ajuster le stock
- ✅ Staff peut voir les ruptures de stock
- ✅ Staff peut voir les alertes de stock
- ✅ Utilisateur régulier ne peut pas modifier le stock
- ✅ Article devient indisponible quand stock = 0

**Total: 6 tests**

### LoyaltyPointsTest.php
Tests du système de fidélité couvrant:
- ✅ Consultation du solde de points
- ✅ Consultation de l'historique des points
- ✅ Ajout de points depuis les jeux
- ✅ Réception de points pour parrainage
- ✅ Consultation du code de parrainage
- ✅ Consultation de la liste des filleuls
- ✅ Points avec date d'expiration
- ✅ Taux de conversion correct (1 point = 100 FCFA)
- ✅ Protection des endpoints

**Total: 9 tests**

## Tests End-to-End

### EndToEndOrderJourneyTest.php
Tests du parcours complet utilisateur couvrant:

#### Test 1: Parcours complet de l'inscription à la livraison
1. ✅ Inscription d'un nouvel utilisateur
2. ✅ Recharge du solde
3. ✅ Consultation du menu
4. ✅ Création d'une commande
5. ✅ Vérification de la décrémentation du stock
6. ✅ Vérification du débit du solde
7. ✅ Vérification du gain de points
8. ✅ Consultation de la commande
9. ✅ Mise à jour du statut par le staff (en_preparation)
10. ✅ Mise à jour du statut (prete)
11. ✅ Mise à jour du statut (livree)
12. ✅ Consultation de l'historique
13. ✅ Vérification du solde de points

#### Test 2: Parcours avec utilisation de points de fidélité
- ✅ Création de commande avec réduction par points
- ✅ Vérification du calcul correct (remise + gain)
- ✅ Vérification de l'historique des points

#### Test 3: Parcours échouant avec stock insuffisant
- ✅ Tentative de commande avec quantité > stock
- ✅ Vérification que rien n'est modifié (rollback)

**Total: 3 tests E2E complets**

## Exécution des Tests

### Exécuter tous les tests
```bash
php artisan test
```

### Exécuter les tests unitaires uniquement
```bash
php artisan test --testsuite=Unit
```

### Exécuter les tests fonctionnels uniquement
```bash
php artisan test --testsuite=Feature
```

### Exécuter un fichier de test spécifique
```bash
php artisan test tests/Feature/CommandeTest.php
```

### Exécuter un test spécifique
```bash
php artisan test --filter test_name
```

### Exécuter avec couverture de code
```bash
php artisan test --coverage
```

### Exécuter en mode verbeux
```bash
php artisan test --verbose
```

## Configuration des Tests

Les tests utilisent une base de données SQLite en mémoire configurée dans `phpunit.xml`:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

## Factories

Des factories ont été créées pour faciliter la génération de données de test:

### UserFactory
Génère des utilisateurs avec:
- Nom et prénom aléatoires
- Email unique
- Téléphone sénégalais (+221)
- Code de parrainage unique
- Solde et points initialisés à 0

### CategorieMenuFactory
Génère des catégories de menu avec:
- Nom de catégorie (Plats, Boissons, Desserts, Entrées)
- Description

### MenuFactory
Génère des articles de menu avec:
- Catégorie associée
- Nom, description, prix
- Temps de préparation
- Disponibilité

## Bonnes Pratiques Implémentées

1. **RefreshDatabase**: Tous les tests utilisent le trait `RefreshDatabase` pour garantir l'isolation
2. **Transactions**: Les tests de commandes vérifient les rollbacks en cas d'erreur
3. **Assertions claires**: Chaque test vérifie des comportements spécifiques
4. **Nommage explicite**: Les noms de tests décrivent clairement ce qui est testé
5. **Couverture complète**: Tests positifs et négatifs pour chaque fonctionnalité
6. **Tests E2E**: Validation du parcours utilisateur complet

## Résumé de la Couverture

| Catégorie | Nombre de Tests | Statut |
|-----------|----------------|--------|
| Tests Unitaires | 28 | ✅ |
| Tests Fonctionnels | 48 | ✅ |
| Tests E2E | 3 | ✅ |
| **TOTAL** | **79** | ✅ |

## Fonctionnalités Testées

### Authentification
- ✅ Inscription / Connexion / Déconnexion
- ✅ Validation des données
- ✅ Gestion des tokens
- ✅ Système de parrainage

### Gestion des Commandes
- ✅ Création de commande
- ✅ Gestion du stock
- ✅ Gestion du solde
- ✅ Calcul des montants
- ✅ Workflow de statuts
- ✅ Permissions (user vs staff)

### Gestion du Menu
- ✅ CRUD complet
- ✅ Gestion de la disponibilité
- ✅ Permissions staff

### Gestion du Stock
- ✅ Mise à jour et ajustement
- ✅ Alertes et ruptures
- ✅ Synchronisation avec disponibilité

### Système de Fidélité
- ✅ Gain de points sur achats
- ✅ Utilisation de points
- ✅ Historique
- ✅ Parrainage
- ✅ Expiration des points

### Parcours Utilisateur Complet
- ✅ De l'inscription à la livraison
- ✅ Avec utilisation de points
- ✅ Gestion des erreurs

## Maintenance

Pour maintenir la qualité des tests:

1. **Exécuter les tests avant chaque commit**
2. **Ajouter des tests pour chaque nouvelle fonctionnalité**
3. **Mettre à jour les tests existants si le comportement change**
4. **Vérifier la couverture de code régulièrement**
5. **Documenter les cas limites testés**

## Notes Importantes

- Les tests utilisent des transactions pour garantir l'isolation
- Les factories permettent de générer rapidement des données de test
- Les tests E2E valident le parcours complet de l'utilisateur
- Tous les tests sont indépendants et peuvent être exécutés dans n'importe quel ordre
