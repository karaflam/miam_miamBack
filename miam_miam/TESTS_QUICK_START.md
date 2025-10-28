# Guide Rapide - Tests MiamMiam

## 🚀 Démarrage Rapide

### Installation
```bash
# Installer les dépendances
composer install

# Copier le fichier .env
cp .env.example .env.testing

# Générer la clé d'application
php artisan key:generate
```

### Exécution des Tests

#### Tous les tests
```bash
php artisan test
```

#### Tests par catégorie
```bash
# Tests unitaires uniquement
php artisan test --testsuite=Unit

# Tests fonctionnels uniquement
php artisan test --testsuite=Feature
```

#### Tests spécifiques
```bash
# Un fichier de test
php artisan test tests/Feature/CommandeTest.php

# Un test spécifique
php artisan test --filter authenticated_user_can_create_order
```

## 📊 Résultats Attendus

Après exécution, vous devriez voir:
```
PASS  Tests\Unit\UserModelTest
✓ it can create a user
✓ it hides password in array
✓ it has commandes relationship
...

PASS  Tests\Feature\AuthenticationTest
✓ user can register with valid data
✓ user can login with valid credentials
...

PASS  Tests\Feature\EndToEndOrderJourneyTest
✓ complete user journey from registration to order delivery
...

Tests:    79 passed (XXX assertions)
Duration: XX.XXs
```

## 🧪 Tests Principaux

### 1. Tests d'Authentification
```bash
php artisan test tests/Feature/AuthenticationTest.php
```
Vérifie: inscription, connexion, déconnexion, parrainage

### 2. Tests de Commandes
```bash
php artisan test tests/Feature/CommandeTest.php
```
Vérifie: création, stock, solde, points de fidélité, statuts

### 3. Tests End-to-End
```bash
php artisan test tests/Feature/EndToEndOrderJourneyTest.php
```
Vérifie: parcours complet utilisateur de l'inscription à la livraison

## 🔍 Déboguer un Test qui Échoue

### Mode verbeux
```bash
php artisan test --verbose
```

### Arrêter à la première erreur
```bash
php artisan test --stop-on-failure
```

### Afficher les détails d'erreur
```bash
php artisan test --testdox
```

## 📝 Scénarios de Test Clés

### Scénario 1: Commande Simple
1. Utilisateur s'inscrit
2. Recharge son solde
3. Consulte le menu
4. Passe une commande
5. Staff traite la commande
6. Commande livrée

**Test:** `EndToEndOrderJourneyTest::complete_user_journey_from_registration_to_order_delivery`

### Scénario 2: Commande avec Points
1. Utilisateur avec points de fidélité
2. Utilise des points pour réduction
3. Gagne de nouveaux points sur l'achat

**Test:** `EndToEndOrderJourneyTest::complete_user_journey_with_loyalty_points_usage`

### Scénario 3: Gestion d'Erreur
1. Tentative de commande avec stock insuffisant
2. Vérification du rollback complet

**Test:** `EndToEndOrderJourneyTest::user_journey_fails_with_insufficient_stock`

## ⚠️ Problèmes Courants

### Erreur de base de données
```bash
# Vérifier la configuration dans phpunit.xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

### Erreur de factory
```bash
# Vérifier que les factories sont bien créées
php artisan make:factory NomModelFactory
```

### Erreur de migration
```bash
# Rafraîchir les migrations
php artisan migrate:fresh
```

## 📈 Couverture de Code

```bash
# Générer un rapport de couverture (nécessite Xdebug)
php artisan test --coverage

# Rapport HTML détaillé
php artisan test --coverage-html coverage
```

## 🎯 Checklist Avant Déploiement

- [ ] Tous les tests passent
- [ ] Couverture > 80%
- [ ] Tests E2E validés
- [ ] Pas de tests ignorés (@skip)
- [ ] Documentation à jour

## 💡 Conseils

1. **Exécutez les tests fréquemment** pendant le développement
2. **Écrivez les tests en même temps** que le code
3. **Utilisez les factories** pour générer des données de test
4. **Testez les cas limites** (erreurs, validations)
5. **Gardez les tests simples** et lisibles

## 🔗 Ressources

- [Documentation Laravel Testing](https://laravel.com/docs/testing)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- Documentation complète: `TESTS_DOCUMENTATION.md`

## 📞 Support

En cas de problème avec les tests:
1. Vérifier les logs: `storage/logs/laravel.log`
2. Exécuter en mode verbeux: `--verbose`
3. Consulter la documentation complète
