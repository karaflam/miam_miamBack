# 🎯 Guide d'Intégration - Menu et Réclamations dans les Dashboards

## 📋 Vue d'ensemble

Ce guide explique comment intégrer la gestion du menu et des réclamations dans les trois dashboards staff :
- **EmployeeDashboard** - Gestion du menu + Traitement des réclamations
- **ManagerDashboard** - Gestion du menu + Traitement des réclamations
- **AdminDashboard** - Gestion du menu + Traitement des réclamations

## 🚀 Étape 1 : Prérequis Backend

### Exécuter les seeders

```bash
cd miam_miam

# Créer les catégories et le menu
php artisan db:seed --class=CategorieMenuSeeder
php artisan db:seed --class=MenuSeeder

# Vérifier les données
php artisan tinker
>>> App\Models\Menu::count()
>>> App\Models\CategorieMenu::count()
>>> App\Models\Reclamation::count()
```

### Vérifier les routes API

```bash
php artisan route:list --path=menu
php artisan route:list --path=reclamations
```

## 🔌 Endpoints disponibles

### Menu
```
GET    /api/menu                              # Liste des articles
GET    /api/menu/{id}                         # Détails d'un article
GET    /api/categories                        # Liste des catégories
POST   /api/menu                              # Créer (staff)
PUT    /api/menu/{id}                         # Modifier (staff)
DELETE /api/menu/{id}                         # Supprimer (staff)
POST   /api/menu/{id}/toggle-disponibilite   # Toggle (staff)
```

### Réclamations
```
GET    /api/staff/reclamations                # Liste toutes
GET    /api/staff/reclamations/statistics     # Statistiques
POST   /api/staff/reclamations/{id}/assign    # Assigner
PUT    /api/staff/reclamations/{id}/status    # Mettre à jour statut
```

## 📝 Étape 2 : Intégration dans EmployeeDashboard

### 1. Ajouter les onglets

Dans `EmployeeDashboard.jsx`, ajoutez les onglets "menu" et "reclamations" :

```jsx
const tabs = [
  { id: "overview", label: "Vue d'ensemble", icon: Home },
  { id: "orders", label: "Commandes", icon: ShoppingBag },
  { id: "menu", label: "Menu", icon: Package },
  { id: "reclamations", label: "Réclamations", icon: AlertCircle },
  { id: "profile", label: "Profil", icon: User }
];
```

### 2. Copier le code du menu

Ouvrez `CODE_MENU_DASHBOARD.jsx` et copiez :
- Les imports en haut du fichier
- Les états (useState)
- Les fonctions de récupération (fetchCategories, fetchMenuItems)
- Les fonctions CRUD (handleCreate, handleUpdate, handleDelete, handleToggle)
- Le composant JSX dans le switch case

### 3. Copier le code des réclamations

Ouvrez `CODE_RECLAMATIONS_DASHBOARD.jsx` et copiez :
- Les imports
- Les états
- Les fonctions de récupération
- Les fonctions de gestion
- Le composant JSX dans le switch case

### 4. Exemple d'intégration complète

```jsx
import React, { useState, useEffect } from 'react';
import {
  Home, ShoppingBag, Package, AlertCircle, User,
  Edit, Trash2, Plus, CheckCircle, Ban, Clock, X, MessageSquare
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // États pour le menu
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchMenuTerm, setSearchMenuTerm] = useState('');
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    temps_preparation: '',
    image: ''
  });

  // États pour les réclamations
  const [reclamations, setReclamations] = useState([]);
  const [isLoadingReclamations, setIsLoadingReclamations] = useState(false);
  const [reclamationStats, setReclamationStats] = useState(null);
  const [selectedReclamationStatus, setSelectedReclamationStatus] = useState('all');
  const [showReclamationModal, setShowReclamationModal] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    statut: '',
    commentaire_resolution: ''
  });

  // Fonctions du menu (copiez depuis CODE_MENU_DASHBOARD.jsx)
  const fetchCategories = async () => { /* ... */ };
  const fetchMenuItems = async () => { /* ... */ };
  const handleCreateMenuItem = async () => { /* ... */ };
  const handleUpdateMenuItem = async () => { /* ... */ };
  const handleDeleteMenuItem = async (item) => { /* ... */ };
  const handleToggleDisponibilite = async (item) => { /* ... */ };
  const handleEditMenuItem = (item) => { /* ... */ };
  const resetMenuForm = () => { /* ... */ };

  // Fonctions des réclamations (copiez depuis CODE_RECLAMATIONS_DASHBOARD.jsx)
  const fetchReclamations = async () => { /* ... */ };
  const fetchReclamationStats = async () => { /* ... */ };
  const handleUpdateReclamationStatus = async () => { /* ... */ };
  const handleViewReclamation = (reclamation) => { /* ... */ };
  const getStatusBadge = (statut) => { /* ... */ };
  const formatDate = (dateString) => { /* ... */ };

  // useEffect pour charger les données
  useEffect(() => {
    if (activeTab === "menu") {
      fetchCategories();
      fetchMenuItems();
    }
  }, [activeTab, selectedCategory, searchMenuTerm]);

  useEffect(() => {
    if (activeTab === "reclamations") {
      fetchReclamations();
      fetchReclamationStats();
    }
  }, [activeTab, selectedReclamationStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-primary">Miam Miam - Employé</h1>
            <button onClick={handleLogout} className="text-red-600">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Onglets */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div>Vue d'ensemble</div>
        )}

        {activeTab === "orders" && (
          <div>Gestion des commandes</div>
        )}

        {activeTab === "menu" && (
          // Copiez le JSX depuis CODE_MENU_DASHBOARD.jsx
          <div className="space-y-6">
            {/* Gestion du menu */}
          </div>
        )}

        {activeTab === "reclamations" && (
          // Copiez le JSX depuis CODE_RECLAMATIONS_DASHBOARD.jsx
          <div className="space-y-6">
            {/* Gestion des réclamations */}
          </div>
        )}

        {activeTab === "profile" && (
          <div>Profil</div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
```

## 📝 Étape 3 : Intégration dans ManagerDashboard

Le processus est identique à EmployeeDashboard :

1. Ajoutez les onglets "menu" et "reclamations"
2. Copiez les états depuis les fichiers de code
3. Copiez les fonctions depuis les fichiers de code
4. Copiez les composants JSX dans le switch case

## 📝 Étape 4 : Intégration dans AdminDashboard

Même processus que pour EmployeeDashboard et ManagerDashboard.

L'admin a accès à toutes les fonctionnalités :
- Gestion complète du menu
- Traitement de toutes les réclamations
- Statistiques globales

## 🎨 Personnalisation

### Modifier les couleurs

Dans les fichiers JSX, remplacez les classes Tailwind :
- `bg-primary` → Votre couleur primaire
- `text-primary` → Votre couleur de texte primaire
- `hover:bg-primary-dark` → Votre couleur hover

### Ajouter des notifications

Remplacez les `alert()` par des notifications toast :

```jsx
// Installer react-toastify
npm install react-toastify

// Dans votre composant
import { toast } from 'react-toastify';

// Remplacer
alert('Article créé avec succès!');

// Par
toast.success('Article créé avec succès!');
```

### Ajouter la pagination

Pour le menu :

```jsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 12;

const paginatedItems = menuItems.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

// Afficher paginatedItems au lieu de menuItems
```

## 🧪 Tests

### Test du menu

1. Se connecter avec `admin@test.com` / `password`
2. Aller dans l'onglet "Menu"
3. Vérifier que les 5 plats s'affichent
4. Tester la création d'un nouveau plat
5. Tester la modification d'un plat
6. Tester le toggle de disponibilité
7. Tester la suppression d'un plat

### Test des réclamations

1. Créer une réclamation depuis le compte utilisateur
2. Se connecter en tant que staff
3. Aller dans l'onglet "Réclamations"
4. Vérifier que la réclamation s'affiche
5. Cliquer sur "Traiter"
6. Changer le statut en "En cours"
7. Ajouter un commentaire
8. Mettre à jour
9. Vérifier que le statut a changé

### Test des filtres

**Menu** :
- Filtrer par catégorie
- Rechercher un plat par nom
- Vérifier que les résultats sont corrects

**Réclamations** :
- Filtrer par statut (Ouvert, En cours, Résolu, Rejeté)
- Vérifier que les statistiques se mettent à jour

## 🐛 Dépannage

### Le menu ne s'affiche pas

1. Vérifier que les seeders ont été exécutés
2. Vérifier la console du navigateur (F12)
3. Vérifier que l'URL de l'API est correcte
4. Vérifier que le token est présent

```javascript
console.log('Token:', localStorage.getItem('auth_token'));
```

### Erreur 401 lors de la création d'un article

1. Vérifier que l'utilisateur est authentifié
2. Vérifier que le token est valide
3. Se reconnecter si nécessaire

### Les images ne s'affichent pas

1. Vérifier que les URLs sont accessibles
2. Tester l'URL dans un navigateur
3. Vérifier la configuration CORS

### Erreur 403 lors de l'accès aux réclamations

1. Vérifier que l'utilisateur a le rôle "employe", "manager" ou "admin"
2. Utiliser l'endpoint de diagnostic :

```javascript
fetch('http://localhost:8000/api/diagnostic/auth', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

## 📚 Fichiers de référence

- **`CODE_MENU_DASHBOARD.jsx`** - Code complet pour la gestion du menu
- **`CODE_RECLAMATIONS_DASHBOARD.jsx`** - Code complet pour les réclamations
- **`README_MENU.md`** - Documentation du système de menu
- **`README_CORRECTIONS_AUTH.md`** - Documentation de l'authentification

## ✅ Checklist d'intégration

### EmployeeDashboard
- [ ] Onglet "Menu" ajouté
- [ ] Onglet "Réclamations" ajouté
- [ ] États copiés
- [ ] Fonctions copiées
- [ ] JSX copié
- [ ] Tests effectués

### ManagerDashboard
- [ ] Onglet "Menu" ajouté
- [ ] Onglet "Réclamations" ajouté
- [ ] États copiés
- [ ] Fonctions copiées
- [ ] JSX copié
- [ ] Tests effectués

### AdminDashboard
- [ ] Onglet "Menu" ajouté
- [ ] Onglet "Réclamations" ajouté
- [ ] États copiés
- [ ] Fonctions copiées
- [ ] JSX copié
- [ ] Tests effectués

## 🎯 Prochaines étapes

1. **Améliorer l'UX**
   - Ajouter des notifications toast
   - Ajouter des animations
   - Améliorer le design

2. **Ajouter des fonctionnalités**
   - Upload d'images local
   - Export des réclamations en PDF
   - Assignation automatique des réclamations

3. **Optimisations**
   - Ajouter la pagination
   - Ajouter le cache
   - Optimiser les requêtes

---

**Besoin d'aide ?**
- Consultez les fichiers de code fournis
- Vérifiez les logs Laravel : `storage/logs/laravel.log`
- Testez les endpoints avec Postman ou cURL
