"use client"

import { useState, useEffect } from "react"
import { mockOrders as initialOrders } from "../data/mockData"
import { Clock, CheckCircle, Package, TrendingUp, Search, Plus, Edit, Trash2, Ban, X } from "lucide-react"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("orders")
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  // États pour le menu
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchMenuTerm, setSearchMenuTerm] = useState('')
  const [showMenuItemModal, setShowMenuItemModal] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    temps_preparation: '',
    image: ''
  })

  // Fonctions Menu
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

  useEffect(() => {
    if (activeTab === "menu") {
      fetchCategories();
      fetchMenuItems();
    }
  }, [activeTab, selectedCategory, searchMenuTerm]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter
    const matchesSearch =
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.includes(searchTerm)
    return matchesFilter && matchesSearch
  })

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-muted text-muted-foreground"
      case "preparing":
        return "bg-warning/20 text-warning"
      case "ready":
        return "bg-primary/20 text-primary"
      case "completed":
        return "bg-success/20 text-success"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "preparing":
        return "En préparation"
      case "ready":
        return "Prête"
      case "completed":
        return "Terminée"
      default:
        return status
    }
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "preparing"
      case "preparing":
        return "ready"
      case "ready":
        return "completed"
      default:
        return currentStatus
    }
  }

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "Commencer"
      case "preparing":
        return "Marquer prête"
      case "ready":
        return "Terminer"
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord Employé</h1>
          <p className="text-muted-foreground">Gérez les commandes et le menu</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeTab === "orders" ? "bg-primary text-secondary" : "bg-white text-foreground hover:bg-white/80"
            }`}
          >
            Commandes
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeTab === "menu" ? "bg-primary text-secondary" : "bg-white text-foreground hover:bg-white/80"
            }`}
          >
            Menu
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <FadeInOnScroll delay={0}>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={150}>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En préparation</p>
                  <p className="text-2xl font-bold">{stats.preparing}</p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={300}>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prêtes</p>
                  <p className="text-2xl font-bold">{stats.ready}</p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={450}>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Terminées</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou numéro de commande..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { value: "all", label: "Toutes" },
                { value: "pending", label: "En attente" },
                { value: "preparing", label: "En préparation" },
                { value: "ready", label: "Prêtes" },
                { value: "completed", label: "Terminées" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    filter === value ? "bg-primary text-secondary" : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">Commande #{order.id.slice(-6)}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-1">Client: {order.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">
                        {order.deliveryType === "delivery" ? "Livraison" : "Sur place"}
                      </p>
                      <p className="text-2xl font-bold text-primary">{order.total} F</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold mb-3">Articles commandés:</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="font-semibold">{item.price * item.quantity} F</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status !== "completed" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                      {getNextStatusLabel(order.status)}
                    </button>
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        className="px-6 py-3 border border-error text-error rounded-lg font-semibold hover:bg-error/10 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
          </>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Gestion du menu</h2>
              <button
                onClick={() => {
                  resetMenuForm();
                  setShowMenuItemModal(true);
                }}
                className="bg-primary text-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Ajouter un article
              </button>
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un plat..."
                  value={searchMenuTerm}
                  onChange={(e) => setSearchMenuTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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
            </div>

            {/* Liste des articles */}
            {isLoadingMenu ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Chargement du menu...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Aucun article dans le menu</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {menuItems.map((item) => (
                  <FadeInOnScroll key={item.id}>
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      <div className="relative h-48 bg-gray-200">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.nom}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        
                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
                          item.disponible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {item.disponible ? 'Disponible' : 'Indisponible'}
                        </div>
                      </div>

                      <div className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold mb-2">{item.nom}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg sm:text-xl font-bold text-primary">{item.prix} FCFA</span>
                          {item.temps_preparation && (
                            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
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

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleDisponibilite(item)}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                              item.disponible 
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {item.disponible ? <Ban className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />}
                            {item.disponible ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item)}
                            className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </FadeInOnScroll>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Menu Item Modal */}
        {showMenuItemModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowMenuItemModal(false);
              setEditingMenuItem(null);
              resetMenuForm();
            }}
          >
            <div 
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-6">
                {editingMenuItem ? "Modifier l'article" : "Ajouter un article"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  editingMenuItem ? handleUpdateMenuItem() : handleCreateMenuItem();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du plat *</label>
                  <input
                    type="text"
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Ndolé"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={menuFormData.description}
                    onChange={(e) => setMenuFormData({...menuFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Description du plat..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prix (FCFA) *</label>
                    <input
                      type="number"
                      value={menuFormData.price}
                      onChange={(e) => setMenuFormData({...menuFormData, price: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="2500"
                      required
                      min="0"
                      step="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Temps (min)</label>
                    <input
                      type="number"
                      value={menuFormData.temps_preparation}
                      onChange={(e) => setMenuFormData({...menuFormData, temps_preparation: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="45"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie *</label>
                  <select
                    value={menuFormData.category}
                    onChange={(e) => setMenuFormData({...menuFormData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL de l'image</label>
                  <input
                    type="url"
                    value={menuFormData.image}
                    onChange={(e) => setMenuFormData({...menuFormData, image: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                  />
                  {menuFormData.image && (
                    <img 
                      src={menuFormData.image} 
                      alt="Prévisualisation" 
                      className="mt-2 h-32 object-cover rounded"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={menuFormData.available}
                    onChange={(e) => setMenuFormData({...menuFormData, available: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="available" className="text-sm font-medium">
                    Article disponible
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuItemModal(false);
                      setEditingMenuItem(null);
                      resetMenuForm();
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    {editingMenuItem ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
