// ============================================
// EXEMPLE COMPLET - EmployeeDashboard avec Menu et Réclamations
// Ce fichier montre l'intégration complète
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Home, ShoppingBag, Package, AlertCircle, User, LogOut,
  Edit, Trash2, Plus, CheckCircle, Ban, Clock, X, MessageSquare, Search
} from 'lucide-react';

const EmployeeDashboard = () => {
  // ============================================
  // ÉTATS GÉNÉRAUX
  // ============================================
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);

  // ============================================
  // ÉTATS MENU
  // ============================================
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

  // ============================================
  // ÉTATS RÉCLAMATIONS
  // ============================================
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

  // ============================================
  // FONCTIONS GÉNÉRALES
  // ============================================
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  // ============================================
  // FONCTIONS MENU
  // ============================================

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories', {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Erreur catégories:', error);
    }
  };

  const fetchMenuItems = async () => {
    setIsLoadingMenu(true);
    try {
      const token = localStorage.getItem('auth_token');
      let url = 'http://localhost:8000/api/menu';
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('categorie', selectedCategory);
      }
      if (searchMenuTerm) {
        params.append('search', searchMenuTerm);
      }
      
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
      console.error('Erreur menu:', error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

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

  // ============================================
  // FONCTIONS RÉCLAMATIONS
  // ============================================

  const fetchReclamations = async () => {
    setIsLoadingReclamations(true);
    try {
      const token = localStorage.getItem('auth_token');
      let url = 'http://localhost:8000/api/staff/reclamations';
      
      if (selectedReclamationStatus !== 'all') {
        url += `?statut=${selectedReclamationStatus}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setReclamations(data.data);
      }
    } catch (error) {
      console.error('Erreur réclamations:', error);
    } finally {
      setIsLoadingReclamations(false);
    }
  };

  const fetchReclamationStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/staff/reclamations/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setReclamationStats(data.data);
      }
    } catch (error) {
      console.error('Erreur stats réclamations:', error);
    }
  };

  const handleUpdateReclamationStatus = async () => {
    if (!statusFormData.statut) {
      alert('Veuillez sélectionner un statut');
      return;
    }

    if (['resolu', 'rejete'].includes(statusFormData.statut) && !statusFormData.commentaire_resolution) {
      alert('Un commentaire est requis pour résoudre ou rejeter une réclamation');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/staff/reclamations/${selectedReclamation.id_reclamation}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Impossible de mettre à jour le statut'));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Statut mis à jour avec succès!');
      setShowReclamationModal(false);
      setSelectedReclamation(null);
      setStatusFormData({ statut: '', commentaire_resolution: '' });
      fetchReclamations();
      fetchReclamationStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleViewReclamation = (reclamation) => {
    setSelectedReclamation(reclamation);
    setStatusFormData({
      statut: reclamation.statut,
      commentaire_resolution: reclamation.commentaire_resolution || ''
    });
    setShowReclamationModal(true);
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'ouvert': 'bg-blue-100 text-blue-700',
      'en_cours': 'bg-yellow-100 text-yellow-700',
      'resolu': 'bg-green-100 text-green-700',
      'rejete': 'bg-red-100 text-red-700'
    };
    const labels = {
      'ouvert': 'Ouvert',
      'en_cours': 'En cours',
      'resolu': 'Résolu',
      'rejete': 'Rejeté'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[statut]}`}>
        {labels[statut]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================
  // EFFETS
  // ============================================

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

  // ============================================
  // ONGLETS
  // ============================================

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: Home },
    { id: "orders", label: "Commandes", icon: ShoppingBag },
    { id: "menu", label: "Menu", icon: Package },
    { id: "reclamations", label: "Réclamations", icon: AlertCircle },
    { id: "profile", label: "Profil", icon: User }
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-orange-600">Miam Miam - Employé</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                {currentUser?.name || 'Employé'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
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
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-orange-600'
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
        {/* Vue d'ensemble */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Vue d'ensemble</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 mb-2">Commandes aujourd'hui</h3>
                <p className="text-3xl font-bold text-orange-600">0</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 mb-2">Articles au menu</h3>
                <p className="text-3xl font-bold text-orange-600">{menuItems.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 mb-2">Réclamations ouvertes</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {reclamationStats?.ouvert || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Commandes */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestion des Commandes</h2>
            <p className="text-gray-600">Section en cours de développement...</p>
          </div>
        )}

        {/* Menu - Voir CODE_MENU_DASHBOARD.jsx pour le code complet */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            {/* Code du menu ici */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion du Menu</h2>
              <button
                onClick={() => {
                  resetMenuForm();
                  setShowMenuItemModal(true);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter un plat
              </button>
            </div>

            {/* Filtres */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un plat..."
                  value={searchMenuTerm}
                  onChange={(e) => setSearchMenuTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>

            {/* Liste - Voir CODE_MENU_DASHBOARD.jsx pour le reste */}
            {isLoadingMenu ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <p className="mt-4 text-gray-600">Chargement du menu...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Carte article - voir CODE_MENU_DASHBOARD.jsx */}
                    <div className="h-48 bg-gray-200 relative">
                      {item.image && (
                        <img src={item.image} alt={item.nom} className="w-full h-full object-cover" />
                      )}
                      <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
                        item.disponible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.disponible ? 'Disponible' : 'Indisponible'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{item.nom}</h3>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-orange-600">{item.prix} FCFA</span>
                        {item.temps_preparation && (
                          <span className="text-sm text-gray-500">{item.temps_preparation} min</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleDisponibilite(item)}
                          className={`flex-1 px-3 py-2 rounded text-sm ${
                            item.disponible ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.disponible ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleEditMenuItem(item)}
                          className="px-3 py-2 bg-blue-500 text-white rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item)}
                          className="px-3 py-2 bg-red-500 text-white rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Réclamations - Voir CODE_RECLAMATIONS_DASHBOARD.jsx pour le code complet */}
        {activeTab === "reclamations" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestion des Réclamations</h2>
              
              {reclamationStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="text-2xl font-bold">{reclamationStats.total}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg shadow">
                    <p className="text-blue-600 text-sm">Ouvertes</p>
                    <p className="text-2xl font-bold text-blue-700">{reclamationStats.ouvert}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg shadow">
                    <p className="text-yellow-600 text-sm">En cours</p>
                    <p className="text-2xl font-bold text-yellow-700">{reclamationStats.en_cours}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg shadow">
                    <p className="text-green-600 text-sm">Résolues</p>
                    <p className="text-2xl font-bold text-green-700">{reclamationStats.resolu}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg shadow">
                    <p className="text-red-600 text-sm">Rejetées</p>
                    <p className="text-2xl font-bold text-red-700">{reclamationStats.rejete}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Filtres et liste - voir CODE_RECLAMATIONS_DASHBOARD.jsx */}
            <select
              value={selectedReclamationStatus}
              onChange={(e) => setSelectedReclamationStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="resolu">Résolu</option>
              <option value="rejete">Rejeté</option>
            </select>

            {/* Liste des réclamations */}
            <div className="space-y-4">
              {reclamations.map(reclamation => (
                <div key={reclamation.id_reclamation} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{reclamation.sujet}</h3>
                        {getStatusBadge(reclamation.statut)}
                      </div>
                      <p className="text-gray-700 mb-3">{reclamation.description}</p>
                      <div className="text-sm text-gray-600">
                        {formatDate(reclamation.date_ouverture)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewReclamation(reclamation)}
                      className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Traiter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profil */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Section en cours de développement...</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals - Voir les fichiers de code pour les modals complets */}
    </div>
  );
};

export default EmployeeDashboard;
