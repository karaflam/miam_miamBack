# Intégration du Menu avec le Dashboard Admin

## 📋 Vue d'ensemble

Ce document explique comment intégrer le système de gestion du menu avec le dashboard admin.

## 🗄️ Seeders créés

### 1. MenuSeeder

**Fichier** : `database/seeders/MenuSeeder.php`

**Plats créés** :
- **Ndolé** - 2500 FCFA (45 min)
- **Poulet Rôti** - 3500 FCFA (60 min)
- **Eru** - 2800 FCFA (50 min)
- **Okok** - 2600 FCFA (40 min)
- **Poulet DG** - 4000 FCFA (55 min)

**Exécution** :
```bash
cd miam_miam
php artisan db:seed --class=CategorieMenuSeeder
php artisan db:seed --class=MenuSeeder
```

## 🔌 API Endpoints disponibles

### Routes publiques (pas d'authentification requise)

#### 1. Liste des articles du menu
```http
GET /api/menu
```

**Paramètres optionnels** :
- `categorie` : ID de la catégorie
- `search` : Recherche par nom
- `disponible` : `oui` ou `non`

**Exemple** :
```javascript
fetch('http://localhost:8000/api/menu')
  .then(r => r.json())
  .then(data => console.log(data));
```

**Réponse** :
```json
{
  "success": true,
  "data": [
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
      }
    }
  ]
}
```

#### 2. Détails d'un article
```http
GET /api/menu/{id}
```

#### 3. Liste des catégories
```http
GET /api/categories
```

#### 4. Détails d'une catégorie avec ses articles
```http
GET /api/categories/{id}
```

### Routes protégées (authentification staff requise)

#### 5. Créer un article
```http
POST /api/menu
Authorization: Bearer {token}
```

**Body** :
```json
{
  "nom_article": "Koki",
  "description": "Gâteau de haricots cuit à la vapeur",
  "prix": 1500,
  "id_categorie": 1,
  "disponible": "oui",
  "temps_preparation": 30,
  "url_image": "https://..."
}
```

#### 6. Modifier un article
```http
PUT /api/menu/{id}
Authorization: Bearer {token}
```

#### 7. Supprimer un article
```http
DELETE /api/menu/{id}
Authorization: Bearer {token}
```

#### 8. Basculer la disponibilité
```http
POST /api/menu/{id}/toggle-disponibilite
Authorization: Bearer {token}
```

## 🎨 Intégration avec AdminDashboard.jsx

### 1. Récupérer les articles du menu

Ajoutez cette fonction dans `AdminDashboard.jsx` :

```javascript
const [menuItems, setMenuItems] = useState([]);
const [categories, setCategories] = useState([]);
const [isLoadingMenu, setIsLoadingMenu] = useState(false);

// Récupérer les catégories
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/categories', {
      headers: {
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    if (data.success) {
      setCategories(data.data);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
  }
};

// Récupérer les articles du menu
const fetchMenuItems = async () => {
  setIsLoadingMenu(true);
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:8000/api/menu?disponible=all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setMenuItems(data.data);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du menu:', error);
    alert('Erreur lors de la récupération du menu');
  } finally {
    setIsLoadingMenu(false);
  }
};

// Charger au montage du composant
useEffect(() => {
  if (activeTab === "menu") {
    fetchCategories();
    fetchMenuItems();
  }
}, [activeTab]);
```

### 2. Créer un nouvel article

```javascript
const handleCreateMenuItem = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:8000/api/menu', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nom_article: menuFormData.name,
        description: menuFormData.description,
        prix: parseFloat(menuFormData.price),
        id_categorie: menuFormData.category,
        disponible: menuFormData.available ? 'oui' : 'non',
        temps_preparation: menuFormData.temps_preparation || 30,
        url_image: menuFormData.image
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || 'Impossible de créer l\'article'));
      return;
    }

    const data = await response.json();
    alert(data.message || 'Article créé avec succès!');
    setShowMenuItemModal(false);
    resetMenuForm();
    fetchMenuItems(); // Recharger la liste
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la création de l\'article');
  }
};
```

### 3. Modifier un article

```javascript
const handleUpdateMenuItem = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/menu/${editingMenuItem.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nom_article: menuFormData.name,
        description: menuFormData.description,
        prix: parseFloat(menuFormData.price),
        id_categorie: menuFormData.category,
        disponible: menuFormData.available ? 'oui' : 'non',
        temps_preparation: menuFormData.temps_preparation,
        url_image: menuFormData.image
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || 'Impossible de modifier l\'article'));
      return;
    }

    const data = await response.json();
    alert(data.message || 'Article modifié avec succès!');
    setShowMenuItemModal(false);
    setEditingMenuItem(null);
    resetMenuForm();
    fetchMenuItems();
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la modification de l\'article');
  }
};
```

### 4. Supprimer un article

```javascript
const handleDeleteMenuItem = async (item) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.nom}" ?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/menu/${item.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || 'Impossible de supprimer l\'article'));
      return;
    }

    const data = await response.json();
    alert(data.message || 'Article supprimé avec succès!');
    fetchMenuItems();
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la suppression de l\'article');
  }
};
```

### 5. Basculer la disponibilité

```javascript
const handleToggleDisponibilite = async (item) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/menu/${item.id}/toggle-disponibilite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || 'Impossible de modifier la disponibilité'));
      return;
    }

    const data = await response.json();
    alert(data.message);
    fetchMenuItems();
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la modification de la disponibilité');
  }
};
```

### 6. Affichage de la liste

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {isLoadingMenu ? (
    <div className="col-span-full text-center py-8">
      <p>Chargement du menu...</p>
    </div>
  ) : menuItems.length === 0 ? (
    <div className="col-span-full text-center py-8">
      <p>Aucun article dans le menu</p>
    </div>
  ) : (
    menuItems.map((item) => (
      <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Image */}
        <div className="h-48 bg-gray-200 relative">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.nom}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}
          {/* Badge disponibilité */}
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
            item.disponible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {item.disponible ? 'Disponible' : 'Indisponible'}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{item.nom}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-primary">{item.prix} FCFA</span>
            {item.temps_preparation && (
              <span className="text-sm text-gray-500">
                ⏱️ {item.temps_preparation} min
              </span>
            )}
          </div>

          {item.categorie && (
            <div className="mb-3">
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                {item.categorie.nom}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleToggleDisponibilite(item)}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                item.disponible 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {item.disponible ? <Ban className="w-4 h-4 inline mr-1" /> : <CheckCircle className="w-4 h-4 inline mr-1" />}
              {item.disponible ? 'Désactiver' : 'Activer'}
            </button>
            <button
              onClick={() => handleEditMenuItem(item)}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteMenuItem(item)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ))
  )}
</div>
```

## 🧪 Tests

### 1. Tester l'API

```bash
# Exécuter les seeders
php artisan db:seed --class=CategorieMenuSeeder
php artisan db:seed --class=MenuSeeder

# Tester la liste des articles
curl http://localhost:8000/api/menu

# Tester avec authentification
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/menu
```

### 2. Tester depuis le navigateur

```javascript
// Dans la console du navigateur
const token = localStorage.getItem('auth_token');

// Récupérer le menu
fetch('http://localhost:8000/api/menu')
  .then(r => r.json())
  .then(data => console.log('Menu:', data));

// Créer un article (nécessite authentification)
fetch('http://localhost:8000/api/menu', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    nom_article: 'Test',
    description: 'Article de test',
    prix: 1000,
    id_categorie: 1,
    disponible: 'oui'
  })
})
.then(r => r.json())
.then(data => console.log('Créé:', data));
```

## 📝 Structure des données

### Article de menu
```typescript
interface MenuItem {
  id: number;
  nom: string;
  description: string;
  prix: number;
  image: string;
  disponible: boolean;
  temps_preparation: number;
  categorie: {
    id: number;
    nom: string;
    description: string;
  };
  date_creation: string;
  date_modification: string;
}
```

### Catégorie
```typescript
interface Categorie {
  id: number;
  nom: string;
  description: string;
}
```

## ✅ Checklist d'intégration

- [x] Seeders créés (MenuSeeder, CategorieMenuSeeder)
- [x] Contrôleurs créés (MenuController, CategorieMenuController)
- [x] Resources créés (MenuResource, CategorieResource)
- [x] Routes API configurées
- [x] Middleware de permissions appliqué
- [ ] Intégration frontend (AdminDashboard.jsx)
- [ ] Tests des endpoints
- [ ] Gestion des erreurs
- [ ] Upload d'images (optionnel)

## 🚀 Prochaines étapes

1. **Exécuter les seeders** pour créer les données de test
2. **Tester les endpoints** avec Postman ou cURL
3. **Intégrer dans le frontend** en suivant les exemples ci-dessus
4. **Ajouter la gestion des images** (upload local ou service externe)
5. **Améliorer l'UX** avec des notifications toast au lieu d'alerts

## 📚 Documentation API complète

Pour plus de détails sur l'API, consultez :
- `app/Http/Controllers/Api/MenuController.php`
- `app/Http/Controllers/Api/CategorieMenuController.php`
- `routes/api.php`
