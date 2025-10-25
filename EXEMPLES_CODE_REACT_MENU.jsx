// ============================================
// EXEMPLES DE CODE REACT POUR LE MENU
// À intégrer dans AdminDashboard.jsx
// ============================================

// ============================================
// 1. ÉTATS ET VARIABLES
// ============================================

const [menuItems, setMenuItems] = useState([]);
const [categories, setCategories] = useState([]);
const [isLoadingMenu, setIsLoadingMenu] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('all');
const [searchMenuTerm, setSearchMenuTerm] = useState('');

const [menuFormData, setMenuFormData] = useState({
  name: '',
  description: '',
  price: '',
  category: '',
  available: true,
  temps_preparation: '',
  image: ''
});

// ============================================
// 2. FONCTIONS DE RÉCUPÉRATION
// ============================================

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

const fetchMenuItems = async () => {
  setIsLoadingMenu(true);
  try {
    const token = localStorage.getItem('auth_token');
    
    // Construire l'URL avec les filtres
    let url = 'http://localhost:8000/api/menu';
    const params = new URLSearchParams();
    
    if (selectedCategory !== 'all') {
      params.append('categorie', selectedCategory);
    }
    
    if (searchMenuTerm) {
      params.append('search', searchMenuTerm);
    }
    
    // Inclure tous les articles (disponibles et non disponibles) pour l'admin
    params.append('disponible', 'all');
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await fetch(url, {
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
  } finally {
    setIsLoadingMenu(false);
  }
};

// ============================================
// 3. FONCTIONS CRUD
// ============================================

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
        id_categorie: parseInt(menuFormData.category),
        disponible: menuFormData.available ? 'oui' : 'non',
        temps_preparation: menuFormData.temps_preparation ? parseInt(menuFormData.temps_preparation) : null,
        url_image: menuFormData.image || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || JSON.stringify(errorData.errors)));
      return;
    }

    const data = await response.json();
    alert(data.message || 'Article créé avec succès!');
    setShowMenuItemModal(false);
    resetMenuForm();
    fetchMenuItems();
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la création de l\'article');
  }
};

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
        id_categorie: parseInt(menuFormData.category),
        disponible: menuFormData.available ? 'oui' : 'non',
        temps_preparation: menuFormData.temps_preparation ? parseInt(menuFormData.temps_preparation) : null,
        url_image: menuFormData.image || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || JSON.stringify(errorData.errors)));
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

// ============================================
// 4. FONCTIONS UTILITAIRES
// ============================================

const handleEditMenuItem = (item) => {
  setEditingMenuItem(item);
  setMenuFormData({
    name: item.nom,
    description: item.description || '',
    price: item.prix.toString(),
    category: item.categorie?.id?.toString() || '',
    available: item.disponible,
    temps_preparation: item.temps_preparation?.toString() || '',
    image: item.image || ''
  });
  setShowMenuItemModal(true);
};

const resetMenuForm = () => {
  setMenuFormData({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    temps_preparation: '',
    image: ''
  });
  setEditingMenuItem(null);
};

const handleMenuFormChange = (e) => {
  const { name, value, type, checked } = e.target;
  setMenuFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

// ============================================
// 5. EFFETS
// ============================================

useEffect(() => {
  if (activeTab === "menu") {
    fetchCategories();
    fetchMenuItems();
  }
}, [activeTab]);

useEffect(() => {
  if (activeTab === "menu") {
    fetchMenuItems();
  }
}, [selectedCategory, searchMenuTerm]);

// ============================================
// 6. COMPOSANT FILTRE
// ============================================

const MenuFilters = () => (
  <div className="flex gap-4 mb-6">
    {/* Recherche */}
    <div className="flex-1">
      <input
        type="text"
        placeholder="Rechercher un plat..."
        value={searchMenuTerm}
        onChange={(e) => setSearchMenuTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
    
    {/* Filtre par catégorie */}
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="all">Toutes les catégories</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.nom}</option>
      ))}
    </select>
    
    {/* Bouton ajouter */}
    <button
      onClick={() => {
        resetMenuForm();
        setShowMenuItemModal(true);
      }}
      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Ajouter un plat
    </button>
  </div>
);

// ============================================
// 7. COMPOSANT CARTE ARTICLE
// ============================================

const MenuItemCard = ({ item }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
    {/* Image */}
    <div className="h-48 bg-gray-200 relative">
      {item.image ? (
        <img 
          src={item.image} 
          alt={item.nom}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
          }}
        />
      ) : null}
      <div className="fallback-icon absolute inset-0 flex items-center justify-center" 
           style={{ display: item.image ? 'none' : 'flex' }}>
        <Package className="w-16 h-16 text-gray-400" />
      </div>
      
      {/* Badge disponibilité */}
      <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
        item.disponible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {item.disponible ? 'Disponible' : 'Indisponible'}
      </div>
    </div>

    {/* Contenu */}
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2 text-gray-800">{item.nom}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-primary">{item.prix} FCFA</span>
        {item.temps_preparation && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {item.temps_preparation} min
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
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
            item.disponible 
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
          title={item.disponible ? 'Marquer comme indisponible' : 'Marquer comme disponible'}
        >
          {item.disponible ? <Ban className="w-4 h-4 inline mr-1" /> : <CheckCircle className="w-4 h-4 inline mr-1" />}
          {item.disponible ? 'Désactiver' : 'Activer'}
        </button>
        <button
          onClick={() => handleEditMenuItem(item)}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="Modifier"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteMenuItem(item)}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// ============================================
// 8. COMPOSANT MODAL FORMULAIRE
// ============================================

const MenuItemModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {editingMenuItem ? 'Modifier l\'article' : 'Nouvel article'}
        </h2>
        <button
          onClick={() => {
            setShowMenuItemModal(false);
            resetMenuForm();
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        editingMenuItem ? handleUpdateMenuItem() : handleCreateMenuItem();
      }}>
        {/* Nom */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nom du plat *</label>
          <input
            type="text"
            name="name"
            value={menuFormData.name}
            onChange={handleMenuFormChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Ndolé"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={menuFormData.description}
            onChange={handleMenuFormChange}
            rows="3"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Description du plat..."
          />
        </div>

        {/* Prix et Temps */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prix (FCFA) *</label>
            <input
              type="number"
              name="price"
              value={menuFormData.price}
              onChange={handleMenuFormChange}
              required
              min="0"
              step="100"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="2500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Temps de préparation (min)</label>
            <input
              type="number"
              name="temps_preparation"
              value={menuFormData.temps_preparation}
              onChange={handleMenuFormChange}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="45"
            />
          </div>
        </div>

        {/* Catégorie */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Catégorie *</label>
          <select
            name="category"
            value={menuFormData.category}
            onChange={handleMenuFormChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>

        {/* URL Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">URL de l'image</label>
          <input
            type="url"
            name="image"
            value={menuFormData.image}
            onChange={handleMenuFormChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://..."
          />
          {menuFormData.image && (
            <div className="mt-2">
              <img 
                src={menuFormData.image} 
                alt="Prévisualisation" 
                className="h-32 object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Disponibilité */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="available"
              checked={menuFormData.available}
              onChange={handleMenuFormChange}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Article disponible</span>
          </label>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setShowMenuItemModal(false);
              resetMenuForm();
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            {editingMenuItem ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ============================================
// 9. COMPOSANT PRINCIPAL LISTE MENU
// ============================================

const MenuList = () => (
  <div>
    <MenuFilters />
    
    {isLoadingMenu ? (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Chargement du menu...</p>
      </div>
    ) : menuItems.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Aucun article dans le menu</p>
        <button
          onClick={() => {
            resetMenuForm();
            setShowMenuItemModal(true);
          }}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Ajouter le premier article
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    )}
    
    {showMenuItemModal && <MenuItemModal />}
  </div>
);

// ============================================
// 10. INTÉGRATION DANS LE SWITCH
// ============================================

// Dans votre switch case pour activeTab === "menu":
{activeTab === "menu" && <MenuList />}
