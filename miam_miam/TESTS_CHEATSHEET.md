# 🚀 Tests Cheatsheet - MiamMiam

## Commandes Rapides

### Exécution Basique
```bash
# Tous les tests
php artisan test

# Tests unitaires
php artisan test --testsuite=Unit

# Tests fonctionnels
php artisan test --testsuite=Feature

# Parallèle (plus rapide)
php artisan test --parallel
```

### Tests Spécifiques
```bash
# Un fichier
php artisan test tests/Feature/CommandeTest.php

# Un test précis
php artisan test --filter authenticated_user_can_create_order

# Plusieurs tests
php artisan test --filter "test_name|another_test"
```

### Modes d'Affichage
```bash
# Verbeux (détails)
php artisan test --verbose

# Compact
php artisan test --compact

# Avec temps d'exécution
php artisan test --profile

# Liste des tests
php artisan test --list-tests
```

### Gestion d'Erreurs
```bash
# Arrêt à la première erreur
php artisan test --stop-on-failure

# Arrêt après N erreurs
php artisan test --stop-on-error

# Arrêt sur test incomplet
php artisan test --stop-on-incomplete
```

### Couverture de Code
```bash
# Rapport simple
php artisan test --coverage

# Rapport HTML
php artisan test --coverage-html coverage

# Minimum requis
php artisan test --coverage --min=80
```

## Tests par Catégorie

### Authentification
```bash
php artisan test tests/Feature/AuthenticationTest.php
```

### Commandes
```bash
php artisan test tests/Feature/CommandeTest.php
```

### Menu & Stock
```bash
php artisan test tests/Feature/MenuManagementTest.php
php artisan test tests/Feature/StockManagementTest.php
```

### Fidélité
```bash
php artisan test tests/Feature/LoyaltyPointsTest.php
```

### End-to-End
```bash
php artisan test tests/Feature/EndToEndOrderJourneyTest.php
```

## Filtres Utiles

### Par Nom de Test
```bash
# Tests d'authentification
php artisan test --filter authentication

# Tests de commande
php artisan test --filter commande

# Tests de stock
php artisan test --filter stock
```

### Par Type
```bash
# Tests de création
php artisan test --filter create

# Tests de mise à jour
php artisan test --filter update

# Tests d'échec
php artisan test --filter fail
```

## Environnement

### Configuration
```bash
# Utiliser .env.testing
cp .env .env.testing

# Variables importantes
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
```

### Nettoyage
```bash
# Rafraîchir migrations
php artisan migrate:fresh

# Nettoyer cache
php artisan cache:clear
php artisan config:clear
```

## Déboggage

### Informations Détaillées
```bash
# Très verbeux
php artisan test --verbose -vvv

# Avec stack trace
php artisan test --debug

# Afficher les requêtes SQL
DB_LOG_QUERIES=true php artisan test
```

### Isolation de Problèmes
```bash
# Un seul test
php artisan test --filter specific_test_name

# Sans parallélisation
php artisan test --without-parallel

# Ordre aléatoire
php artisan test --random
```

## CI/CD

### GitHub Actions
```yaml
- name: Run tests
  run: php artisan test --parallel --coverage
```

### GitLab CI
```yaml
test:
  script:
    - php artisan test --coverage --min=80
```

## Raccourcis Personnalisés

### Ajouter à composer.json
```json
{
  "scripts": {
    "test": "php artisan test",
    "test:unit": "php artisan test --testsuite=Unit",
    "test:feature": "php artisan test --testsuite=Feature",
    "test:e2e": "php artisan test tests/Feature/EndToEndOrderJourneyTest.php",
    "test:coverage": "php artisan test --coverage --min=80"
  }
}
```

### Utilisation
```bash
composer test
composer test:unit
composer test:feature
composer test:e2e
composer test:coverage
```

## Factories

### Créer des Données de Test
```php
// Utilisateur
$user = User::factory()->create();
$user = User::factory()->create(['solde' => 10000]);

// Menu
$menu = Menu::factory()->create();

// Catégorie
$categorie = CategorieMenu::factory()->create();

// Plusieurs
$users = User::factory()->count(10)->create();
```

## Assertions Courantes

### Réponses HTTP
```php
$response->assertStatus(200);
$response->assertStatus(201);
$response->assertStatus(404);
$response->assertStatus(422);

$response->assertJson(['success' => true]);
$response->assertJsonStructure(['data', 'message']);
$response->assertJsonCount(5, 'data');
$response->assertJsonFragment(['email' => 'test@example.com']);
```

### Base de Données
```php
$this->assertDatabaseHas('users', ['email' => 'test@example.com']);
$this->assertDatabaseMissing('users', ['email' => 'deleted@example.com']);
$this->assertDatabaseCount('commandes', 5);
```

### Modèles
```php
$this->assertEquals(100, $user->point_fidelite);
$this->assertTrue($user->exists);
$this->assertInstanceOf(User::class, $user);
$this->assertNull($user->deleted_at);
```

## Patterns Communs

### Test d'Authentification
```php
$response = $this->postJson('/api/auth/login', [
    'email' => 'test@example.com',
    'password' => 'password',
]);

$response->assertStatus(200)
    ->assertJsonStructure(['token']);
```

### Test avec Utilisateur Authentifié
```php
$user = User::factory()->create();

$response = $this->actingAs($user)
    ->getJson('/api/profile');

$response->assertStatus(200);
```

### Test de Création
```php
$data = ['nom' => 'Test', 'prix' => 1000];

$response = $this->actingAs($staff)
    ->postJson('/api/menu', $data);

$response->assertStatus(201);
$this->assertDatabaseHas('menus', $data);
```

## Résolution de Problèmes

### Erreur de Migration
```bash
php artisan migrate:fresh
php artisan test
```

### Erreur de Factory
```bash
php artisan make:factory ModelFactory
```

### Erreur de Permissions
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Erreur de Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## Métriques Rapides

```bash
# Nombre de tests
php artisan test --list-tests | wc -l

# Temps d'exécution
php artisan test --profile

# Couverture minimale
php artisan test --coverage --min=80
```

## Liens Rapides

- 📚 Documentation complète: `TESTS_DOCUMENTATION.md`
- 🚀 Guide démarrage: `TESTS_QUICK_START.md`
- 📊 Résumé: `TESTS_SUMMARY.md`
- 📁 Structure: `tests/README.md`

---

**Tip**: Ajoutez `alias t='php artisan test'` à votre `.bashrc` ou `.zshrc` pour taper simplement `t` !
