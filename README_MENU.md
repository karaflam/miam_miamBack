# 🍽️ Système de Gestion du Menu - Miam Miam

## 📋 Résumé

Système complet de gestion du menu avec API REST et intégration dashboard admin.

## 🎯 Fonctionnalités

### Pour le public
- ✅ Consultation du menu avec images
- ✅ Filtrage par catégorie
- ✅ Recherche par nom
- ✅ Affichage des prix et temps de préparation
- ✅ Voir uniquement les articles disponibles

### Pour le staff (admin/employé)
- ✅ Créer de nouveaux articles
- ✅ Modifier les articles existants
- ✅ Supprimer des articles
- ✅ Activer/Désactiver la disponibilité
- ✅ Gérer les catégories

## 🗄️ Données de test

### Plats camerounais créés

| Plat | Prix | Temps | Image |
|------|------|-------|-------|
| Ndolé | 2500 FCFA | 45 min | ✅ |
| Poulet Rôti | 3500 FCFA | 60 min | ✅ |
| Eru | 2800 FCFA | 50 min | ✅ |
| Okok | 2600 FCFA | 40 min | ✅ |
| Poulet DG | 4000 FCFA | 55 min | ✅ |

### Catégories disponibles

- Plats principaux
- Boissons
- Desserts
- Entrées

## 🚀 Installation

### 1. Exécuter les migrations (si pas déjà fait)

```bash
cd miam_miam
php artisan migrate
```

### 2. Exécuter les seeders

```bash
# Créer les catégories
php artisan db:seed --class=CategorieMenuSeeder

# Créer les plats
php artisan db:seed --class=MenuSeeder
```

### 3. Vérifier les données

```sql
-- Voir les catégories
SELECT * FROM categories_menu;

-- Voir les articles
SELECT m.id_article, m.nom_article, m.prix, m.disponible, c.nom_categorie
FROM menus m
LEFT JOIN categories_menu c ON m.id_categorie = c.id_categorie;
```

## 🔌 API Endpoints

### Routes publiques

```http
GET /api/menu                    # Liste des articles disponibles
GET /api/menu/{id}               # Détails d'un article
GET /api/categories              # Liste des catégories
GET /api/categories/{id}         # Détails d'une catégorie
```

### Routes protégées (staff uniquement)

```http
POST   /api/menu                           # Créer un article
PUT    /api/menu/{id}                      # Modifier un article
DELETE /api/menu/{id}                      # Supprimer un article
POST   /api/menu/{id}/toggle-disponibilite # Activer/Désactiver
```

## 📝 Exemples d'utilisation

### JavaScript (Frontend)

```javascript
// Récupérer le menu
const fetchMenu = async () => {
  const response = await fetch('http://localhost:8000/api/menu');
  const data = await response.json();
  console.log(data.data); // Liste des articles
};

// Créer un article (nécessite authentification)
const createArticle = async () => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('http://localhost:8000/api/menu', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nom_article: 'Koki',
      description: 'Gâteau de haricots',
      prix: 1500,
      id_categorie: 1,
      disponible: 'oui',
      temps_preparation: 30
    })
  });
  const data = await response.json();
  console.log(data);
};
```

### cURL

```bash
# Récupérer le menu
curl http://localhost:8000/api/menu

# Créer un article
curl -X POST http://localhost:8000/api/menu \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom_article": "Koki",
    "description": "Gâteau de haricots",
    "prix": 1500,
    "id_categorie": 1,
    "disponible": "oui"
  }'
```

### PowerShell

```powershell
# Utiliser le script de test
.\test_menu.ps1
```

## 🎨 Intégration Dashboard

### Fichiers modifiés/créés

**Backend** :
- ✅ `database/seeders/MenuSeeder.php` - Données de test
- ✅ `app/Http/Controllers/Api/MenuController.php` - API complète
- ✅ `app/Http/Controllers/Api/CategorieMenuController.php` - API catégories
- ✅ `app/Http/Resources/MenuResource.php` - Format de réponse
- ✅ `app/Http/Resources/CategorieResource.php` - Format de réponse
- ✅ `app/Models/Menu.php` - Scope disponible ajouté
- ✅ `routes/api.php` - Routes configurées

**Documentation** :
- ✅ `INTEGRATION_MENU_DASHBOARD.md` - Guide complet d'intégration
- ✅ `README_MENU.md` - Ce fichier
- ✅ `test_menu.ps1` - Script de test

### Intégration dans AdminDashboard.jsx

Consultez `INTEGRATION_MENU_DASHBOARD.md` pour :
- Code complet des fonctions React
- Exemples d'affichage
- Gestion des erreurs
- Upload d'images

## 🧪 Tests

### Test automatique

```powershell
.\test_menu.ps1
```

### Test manuel

1. **Démarrer le serveur**
```bash
cd miam_miam
php artisan serve
```

2. **Tester dans le navigateur**
- Ouvrir http://localhost:8000/api/menu
- Vérifier que les 5 plats s'affichent

3. **Tester avec authentification**
```javascript
// Dans la console du navigateur
const token = localStorage.getItem('auth_token');
fetch('http://localhost:8000/api/menu', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

## 📊 Structure de données

### Article (Menu)

```json
{
  "id": 1,
  "nom": "Ndolé",
  "description": "Plat traditionnel camerounais...",
  "prix": 2500,
  "image": "https://...",
  "disponible": true,
  "temps_preparation": 45,
  "categorie": {
    "id": 1,
    "nom": "Plats principaux",
    "description": "Plats chauds et copieux"
  },
  "date_creation": "2024-10-25 20:00:00",
  "date_modification": "2024-10-25 20:00:00"
}
```

### Catégorie

```json
{
  "id": 1,
  "nom": "Plats principaux",
  "description": "Plats chauds et copieux"
}
```

## 🔒 Permissions

| Action | Public | Student | Employee | Manager | Admin |
|--------|--------|---------|----------|---------|-------|
| Voir le menu | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer un article | ❌ | ❌ | ✅ | ✅ | ✅ |
| Modifier un article | ❌ | ❌ | ✅ | ✅ | ✅ |
| Supprimer un article | ❌ | ❌ | ✅ | ✅ | ✅ |
| Toggle disponibilité | ❌ | ❌ | ✅ | ✅ | ✅ |

## 🐛 Dépannage

### Erreur: "Class 'Menu' not found"
```bash
composer dump-autoload
```

### Erreur: "Table 'menus' doesn't exist"
```bash
php artisan migrate
```

### Erreur: "Foreign key constraint fails"
```bash
# Exécuter les seeders dans l'ordre
php artisan db:seed --class=CategorieMenuSeeder
php artisan db:seed --class=MenuSeeder
```

### Les images ne s'affichent pas
- Vérifier que les URLs sont accessibles
- Vérifier la configuration CORS
- Utiliser des URLs HTTPS si possible

## 📚 Documentation complète

- **API** : `INTEGRATION_MENU_DASHBOARD.md`
- **Authentification** : `README_CORRECTIONS_AUTH.md`
- **Tests** : `GUIDE_TEST_AUTHENTIFICATION.md`

## ✅ Checklist

- [x] Migrations créées
- [x] Seeders créés
- [x] Contrôleurs créés
- [x] Resources créés
- [x] Routes configurées
- [x] Permissions appliquées
- [x] Documentation créée
- [x] Scripts de test créés
- [ ] Intégration frontend
- [ ] Tests E2E
- [ ] Upload d'images local

## 🎯 Prochaines étapes

1. **Intégrer dans AdminDashboard.jsx**
   - Copier le code de `INTEGRATION_MENU_DASHBOARD.md`
   - Adapter le design à votre charte graphique

2. **Améliorer l'UX**
   - Ajouter des notifications toast
   - Ajouter une prévisualisation des images
   - Ajouter un système de drag & drop pour les images

3. **Optimisations**
   - Ajouter la pagination
   - Ajouter le cache
   - Optimiser les requêtes SQL

4. **Fonctionnalités avancées**
   - Gestion des stocks
   - Gestion des allergènes
   - Gestion des promotions
   - Système de notation

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les logs : `storage/logs/laravel.log`
3. Testez avec le script : `.\test_menu.ps1`

---

**Créé le** : 25 octobre 2024  
**Version** : 1.0
