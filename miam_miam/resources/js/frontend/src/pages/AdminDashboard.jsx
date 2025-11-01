"use client"

import { useState, useEffect, useRef } from "react"
import { Chart } from 'chart.js/auto'
import { mockUsers as initialUsers, mockPromotions as initialPromotions, mockMenuItems as initialMenuItems } from "../data/mockData"
import { Ban, Clock, Users, Tag, Edit, Trash2, Plus, Search, UserCog, BarChart3, Settings, Bell, Shield, FileText, Gamepad2, Trophy, Play, Pause, RotateCcw, Menu, X, Home, ChevronLeft, ChevronRight , Eye, EyeOff, Package, Calendar, TrendingUp, CheckCircle, Gift, Loader2 } from "lucide-react"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [users, setUsers] = useState([])
  const [promotions, setPromotions] = useState(initialPromotions)
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchMenuTerm, setSearchMenuTerm] = useState('');
  const [error, setError] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showMenuItemModal, setShowMenuItemModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingPromo, setEditingPromo] = useState(null)
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [showGameConfigModal, setShowGameConfigModal] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  
  // États pour la gestion des événements (remplace games et promotions)
  const [events, setEvents] = useState([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [showEventFormModal, setShowEventFormModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventTypeFilter, setEventTypeFilter] = useState('all') // all, promotion, jeu, evenement
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // États pour les données du dashboard
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  
  // Références pour les graphiques
  const performanceChartRef = useRef(null)
  const usersChartRef = useRef(null)
  const chartInstances = useRef({})

  const [userFormData, setUserFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    role: "student",
    type: "user",
    localisation: "",
    id_role: 2,
  })

  const [promoFormData, setPromoFormData] = useState({
    title: "",
    description: "",
    discount: "",
    active: true,
    startDate: "",
    endDate: "",
  })

  const [menuFormData, setMenuFormData] = useState({
  name: '',
  description: '',
  price: '',
  category: '',
  available: true,
  temps_preparation: '',
  image: ''
});

  // États pour la gestion du stock
  const [stockItems, setStockItems] = useState([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockFormData, setStockFormData] = useState({
    quantite_disponible: '',
    seuil_alerte: '5'
  });

  const [eventFormData, setEventFormData] = useState({
    titre: "",
    description: "",
    type: "evenement", // promotion, jeu, evenement
    code_promo: "",
    type_remise: "pourcentage", // pourcentage, fixe, point_bonus
    valeur_remise: "",
    date_debut: "",
    date_fin: "",
    active: "oui",
    limite_utilisation: "",
    affiche: null,
  })
  
  // État pour le modal de modification des jeux intégrés
  const [showIntegratedGameModal, setShowIntegratedGameModal] = useState(false)
  const [integratedGameData, setIntegratedGameData] = useState({
    id_evenement: null,
    titre: "",
    limite_utilisation: "",
    valeur_remise: "",
    description: ""
  })

  // États et données pour les mini-jeux
  const [games, setGames] = useState([
    {
      id: 1,
      name: "Roue de la Fortune",
      description: "Tournez la roue pour gagner des points de fidélité !",
      type: "wheel",
      active: true,
      minPoints: 10,
      maxPoints: 100,
      costToPlay: 5,
      dailyLimit: 3,
      prizes: [
        { id: 1, name: "10 Points", value: 10, probability: 30 },
        { id: 2, name: "25 Points", value: 25, probability: 25 },
        { id: 3, name: "50 Points", value: 50, probability: 20 },
        { id: 4, name: "Réduction 5%", value: "5% de réduction", probability: 15 },
        { id: 5, name: "100 Points", value: 100, probability: 8 },
        { id: 6, name: "Plat Gratuit", value: "1 plat gratuit", probability: 2 }
      ]
    },
    {
      id: 2,
      name: "Quiz Culinaire",
      description: "Testez vos connaissances culinaires camerounaises !",
      type: "quiz",
      active: false,
      minPoints: 15,
      maxPoints: 75,
      costToPlay: 3,
      dailyLimit: 5,
      questions: [
        {
          id: 1,
          question: "Quel est l'ingrédient principal du Ndolé ?",
          options: ["Feuilles de Ndolé", "Plantain", "Riz", "Haricots"],
          correct: 0,
          points: 25
        }
      ]
    },
    {
      id: 3,
      name: "Memory des Plats",
      description: "Retrouvez les paires de plats camerounais !",
      type: "memory",
      active: true,
      minPoints: 5,
      maxPoints: 50,
      costToPlay: 2,
      dailyLimit: 10,
      difficulty: "medium",
      gridSize: "4x4"
    }
  ])

  const [gameFormData, setGameFormData] = useState({
    name: "",
    description: "",
    type: "wheel",
    active: true,
    minPoints: 10,
    maxPoints: 100,
    costToPlay: 5,
    dailyLimit: 3,
  })

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
    
    // Afficher tous les articles pour le staff
    params.append('show_all', 'true');
    
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

useEffect(() => {
  if (activeTab === "menu") {
    fetchCategories();
    fetchMenuItems();
  }
}, [activeTab, selectedCategory, searchMenuTerm]);

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

// Fonctions pour la gestion du stock
const fetchStockItems = async () => {
  setIsLoadingStock(true);
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:8000/api/menu?show_all=true', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setStockItems(data.data);
    }
  } catch (error) {
    console.error('Erreur stock:', error);
  } finally {
    setIsLoadingStock(false);
  }
};

const handleUpdateStock = async () => {
  if (!editingStock) return;
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/stock/${editingStock.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantite_disponible: parseInt(stockFormData.quantite_disponible),
        seuil_alerte: parseInt(stockFormData.seuil_alerte)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || 'Impossible de mettre à jour le stock'));
      return;
    }

    const data = await response.json();
    alert(data.message || 'Stock mis à jour avec succès!');
    setShowStockModal(false);
    resetStockForm();
    fetchStockItems();
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la mise à jour du stock');
  }
};

const handleAdjustStock = async (articleId, ajustement, raison = '') => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/stock/${articleId}/adjust`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ajustement, raison })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || 'Impossible d\'ajuster le stock'));
      return;
    }

    const data = await response.json();
    alert(data.message || 'Stock ajusté avec succès!');
    fetchStockItems();
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de l\'ajustement du stock');
  }
};

const openEditStockModal = (item) => {
  setEditingStock(item);
  setStockFormData({
    quantite_disponible: item.stock?.quantite_disponible?.toString() || '0',
    seuil_alerte: item.stock?.seuil_alerte?.toString() || '5'
  });
  setShowStockModal(true);
};

const resetStockForm = () => {
  setStockFormData({
    quantite_disponible: '',
    seuil_alerte: '5'
  });
  setEditingStock(null);
};

useEffect(() => {
  if (activeTab === "stock") {
    fetchStockItems();
  }
}, [activeTab]);

// ============================================
// GESTION DES ÉVÉNEMENTS (Promotions, Jeux, Événements)
// ============================================

const fetchEvents = async () => {
  setIsLoadingEvents(true);
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:8000/api/evenements', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success || Array.isArray(data.data)) {
      // Tous les événements viennent de la BDD, y compris les jeux intégrés
      setEvents(data.data || data);
    }
  } catch (error) {
    console.error('Erreur chargement événements:', error);
  } finally {
    setIsLoadingEvents(false);
  }
};

const handleCreateOrUpdateEvent = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    
    // Ajouter tous les champs
    Object.keys(eventFormData).forEach(key => {
      if (key === 'affiche' && eventFormData[key]) {
        formData.append(key, eventFormData[key]);
      } else if (eventFormData[key] !== null && eventFormData[key] !== '') {
        formData.append(key, eventFormData[key]);
      }
    });

    const url = editingEvent 
      ? `http://localhost:8000/api/evenements/${editingEvent.id_evenement}`
      : 'http://localhost:8000/api/evenements';
    
    const response = await fetch(url, {
      method: editingEvent ? 'POST' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    if (editingEvent) {
      formData.append('_method', 'PUT');
    }

    const data = await response.json();
    
    if (data.success || data.data) {
      alert(editingEvent ? 'Événement modifié avec succès!' : 'Événement créé avec succès!');
      setShowEventFormModal(false);
      resetEventForm();
      fetchEvents();
    } else {
      alert('Erreur: ' + (data.message || 'Impossible de sauvegarder'));
    }
  } catch (error) {
    console.error('Erreur sauvegarde événement:', error);
    alert('Erreur lors de la sauvegarde');
  }
};

const handleDeleteEvent = async (id) => {
  // Vérifier si c'est un jeu intégré
  const event = events.find(e => e.id_evenement === id);
  if (event && event.is_integrated) {
    alert('Les jeux intégrés (Blackjack, Quiz) ne peuvent pas être supprimés. Vous pouvez uniquement les activer/désactiver.');
    return;
  }
  
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/evenements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.deleted || data.success) {
      alert('Événement supprimé avec succès!');
      fetchEvents();
    }
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    alert('Erreur lors de la suppression');
  }
};

const handleToggleEvent = async (id) => {
  try {
    // Tous les événements (y compris jeux intégrés) passent par l'API
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/evenements/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success || data.data) {
      fetchEvents();
    }
  } catch (error) {
    console.error('Erreur toggle événement:', error);
  }
};

const openEditEventModal = (event) => {
  // Pour les jeux intégrés, ouvrir un modal spécial
  if (event.is_integrated) {
    setIntegratedGameData({
      id_evenement: event.id_evenement,
      titre: event.titre,
      limite_utilisation: event.limite_utilisation?.toString() || '',
      valeur_remise: event.valeur_remise?.toString() || '',
      description: event.description || ''
    });
    setShowIntegratedGameModal(true);
    return;
  }
  
  // Pour les événements normaux
  setEditingEvent(event);
  setEventFormData({
    titre: event.titre || '',
    description: event.description || '',
    type: event.type || 'evenement',
    code_promo: event.code_promo || '',
    type_remise: event.type_remise || 'pourcentage',
    valeur_remise: event.valeur_remise?.toString() || '',
    date_debut: event.date_debut || '',
    date_fin: event.date_fin || '',
    active: event.active || 'oui',
    limite_utilisation: event.limite_utilisation?.toString() || '',
    affiche: null
  });
  setShowEventFormModal(true);
};

const resetEventForm = () => {
  setEventFormData({
    titre: '',
    description: '',
    type: 'evenement',
    code_promo: '',
    type_remise: 'pourcentage',
    valeur_remise: '',
    date_debut: '',
    date_fin: '',
    active: 'oui',
    limite_utilisation: '',
    affiche: null
  });
  setEditingEvent(null);
};

const handleEventFormChange = (e) => {
  const { name, value, type, files } = e.target;
  setEventFormData(prev => ({
    ...prev,
    [name]: type === 'file' ? files[0] : value
  }));
};

// Gérer les changements dans le modal jeux intégrés
const handleIntegratedGameChange = (e) => {
  const { name, value } = e.target;
  setIntegratedGameData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Sauvegarder les modifications d'un jeu intégré
const handleSaveIntegratedGame = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/evenements/${integratedGameData.id_evenement}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        limite_utilisation: parseInt(integratedGameData.limite_utilisation),
        valeur_remise: parseFloat(integratedGameData.valeur_remise),
        description: integratedGameData.description
      })
    });
    
    const data = await response.json();
    if (data.success || data.data) {
      alert('Jeu mis à jour avec succès!');
      setShowIntegratedGameModal(false);
      fetchEvents();
    } else {
      alert('Erreur: ' + (data.message || 'Impossible de sauvegarder'));
    }
  } catch (error) {
    console.error('Erreur sauvegarde jeu intégré:', error);
    alert('Erreur lors de la sauvegarde');
  }
};

useEffect(() => {
  if (activeTab === "events") {
    fetchEvents();
  }
}, [activeTab]);

// ============================================
// FIN GESTION DES ÉVÉNEMENTS
// ============================================

  const handleUserFormChange = (e) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({
      ...prev,
      [name]: name === "balance" || name === "loyaltyPoints" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handlePromoFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setPromoFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "discount" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Impossible de créer l\'utilisateur'));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur créé avec succès!');
      setShowUserModal(false);
      resetUserForm();
      fetchUsers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'utilisateur');
    }
  }

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userFormData,
          type: editingUser.type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Impossible de modifier l\'utilisateur'));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur modifié avec succès!');
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      fetchUsers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification de l\'utilisateur');
    }
  }

  const handleDeleteUser = async (userId, userType) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver cet utilisateur ?")) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}?type=${userType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: userType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Impossible de supprimer l\'utilisateur'));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur désactivé avec succès!');
      fetchUsers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  }

  const handleSuspendUser = async (user) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Impossible de suspendre l\'utilisateur'));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur suspendu avec succès!');
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suspension de l\'utilisateur');
    }
  };

  const handleActivateUser = async (user) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${user.id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Impossible d\'activer l\'utilisateur'));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur activé avec succès!');
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'activation de l\'utilisateur');
    }
  };

  // Fonctions pour la gestion des mini-jeux
  const handleGameFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setGameFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
               (name === "minPoints" || name === "maxPoints" || name === "costToPlay" || name === "dailyLimit") 
               ? Number.parseInt(value) || 0 : value,
    }))
  }

  const toggleGameStatus = (gameId) => {
    setGames(games.map(game => 
      game.id === gameId ? { ...game, active: !game.active } : game
    ))
  }

  const handleEditGame = (game) => {
    setEditingGame(game)
    setGameFormData({
      name: game.name,
      description: game.description,
      type: game.type,
      active: game.active,
      minPoints: game.minPoints,
      maxPoints: game.maxPoints,
      costToPlay: game.costToPlay,
      dailyLimit: game.dailyLimit,
    })
    setShowGameConfigModal(true)
  }

  const handleSaveGame = () => {
    if (editingGame) {
      setGames(games.map(game => 
        game.id === editingGame.id ? { ...game, ...gameFormData } : game
      ))
    } else {
      const newGame = {
        id: Date.now(),
        ...gameFormData,
        prizes: gameFormData.type === 'wheel' ? [
          { id: 1, name: "10 Points", value: 10, probability: 30 },
          { id: 2, name: "25 Points", value: 25, probability: 25 },
          { id: 3, name: "50 Points", value: 50, probability: 45 }
        ] : []
      }
      setGames([...games, newGame])
    }
    setShowGameConfigModal(false)
    setEditingGame(null)
    resetGameForm()
  }

  const resetGameForm = () => {
    setGameFormData({
      name: "",
      description: "",
      type: "wheel",
      active: true,
      minPoints: 10,
      maxPoints: 100,
      costToPlay: 5,
      dailyLimit: 3,
    })
  }

  const handleDeleteGame = (gameId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce mini-jeu ?")) {
      setGames(games.filter(game => game.id !== gameId))
    }
  }

  const handleAddPromo = () => {
    const newPromo = {
      id: Date.now().toString(),
      ...promoFormData,
    }
    setPromotions([...promotions, newPromo])
    setShowPromoModal(false)
    resetPromoForm()
  }

  const handleEditPromo = () => {
    setPromotions(promotions.map((promo) => (promo.id === editingPromo.id ? { ...promo, ...promoFormData } : promo)))
    setEditingPromo(null)
    resetPromoForm()
  }

  const handleDeletePromo = (promoId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) {
      setPromotions(promotions.filter((promo) => promo.id !== promoId))
    }
  }

  const togglePromoStatus = (promoId) => {
    setPromotions(promotions.map((promo) => (promo.id === promoId ? { ...promo, active: !promo.active } : promo)))
  }

  const resetUserForm = () => {
    setUserFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      mot_de_passe: "",
      role: "student",
      type: "user",
      localisation: "",
      id_role: 2,
    })
  }

  const resetPromoForm = () => {
    setPromoFormData({
      title: "",
      description: "",
      discount: "",
      active: true,
      startDate: "",
      endDate: "",
    })
  }

  // Initialisation des graphiques
  useEffect(() => {
    // Nettoyer les graphiques existants
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });

    if (activeTab === 'dashboard' && dashboardData) {
      // Graphique de performance
      if (performanceChartRef.current && dashboardData.performance_globale) {
        const labels = dashboardData.performance_globale.map(item => item.mois);
        const caData = dashboardData.performance_globale.map(item => item.chiffre_affaire);
        const commandesData = dashboardData.performance_globale.map(item => item.commandes);

        chartInstances.current.performance = new Chart(performanceChartRef.current, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Chiffre d\'affaires (F)',
                data: caData,
                borderColor: '#cfbd97',
                backgroundColor: 'rgba(207, 189, 151, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Commandes',
                data: commandesData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }

      // Graphique utilisateurs
      if (usersChartRef.current && dashboardData.repartition_utilisateurs) {
        const repartition = dashboardData.repartition_utilisateurs;
        
        console.log('📊 Répartition utilisateurs:', repartition);
        console.log('📊 Données graphique:', [
          repartition.etudiants?.count || 0,
          repartition.employes?.count || 0,
          repartition.managers?.count || 0,
          repartition.admins?.count || 0
        ]);
        
        const chartData = [
          repartition.etudiants?.count || 0,
          repartition.employes?.count || 0,
          repartition.managers?.count || 0,
          repartition.admins?.count || 0
        ];
        
        // Vérifier qu'il y a au moins une donnée non nulle
        const hasData = chartData.some(val => val > 0);
        
        if (hasData) {
          chartInstances.current.users = new Chart(usersChartRef.current, {
            type: 'doughnut',
            data: {
              labels: ['Étudiants', 'Employés', 'Managers', 'Admins'],
              datasets: [{
                data: chartData,
                backgroundColor: ['#cfbd97', '#3b82f6', '#10b981', '#f59e0b'],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
        } else {
          console.warn('⚠️ Aucune donnée pour le graphique de répartition');
        }
      } else {
        console.warn('⚠️ Graphique répartition: ref ou données manquantes', {
          hasRef: !!usersChartRef.current,
          hasData: !!dashboardData.repartition_utilisateurs
        });
      }
    }

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [activeTab, dashboardData]);

  // Raccourci clavier pour basculer la sidebar
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + B pour basculer la sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  const openEditUserModal = (user) => {
    setEditingUser(user)
    setUserFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || "",
      role: user.role,
      type: user.type,
      localisation: user.localisation || "",
      id_role: user.role === 'admin' ? 4 : user.role === 'manager' ? 3 : user.role === 'employee' ? 2 : 1,
    })
    setShowUserModal(true)
  }

  const openEditPromoModal = (promo) => {
    setEditingPromo(promo)
    setPromoFormData({
      title: promo.title,
      description: promo.description,
      discount: promo.discount.toString(),
      active: promo.active,
      startDate: promo.startDate,
      endDate: promo.endDate,
    })
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-error/20 text-error"
      case "manager":
        return "bg-warning/20 text-warning"
      case "employee":
        return "bg-primary/20 text-primary"
      case "student":
        return "bg-success/20 text-success"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrateur"
      case "manager":
        return "Manager"
      case "employee":
        return "Employé"
      case "student":
        return "Étudiant"
      default:
        return role
    }
  }

  const fetchUsers = async () => {
  setIsLoading(true);
  setError(null);
  try {
    // Utiliser 'auth_token' au lieu de 'token' (cohérent avec api.js)
    const token = localStorage.getItem('auth_token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    console.log('🔑 Token trouvé:', token ? 'Oui (longueur: ' + token.length + ')' : 'Non');
    console.log('👤 Utilisateur actuel:', currentUser);
    
    if (!token) {
      console.error('❌ Aucun token trouvé - Redirection vers /login');
      alert('Vous devez être connecté pour accéder à cette page');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    
    // Vérifier si l'utilisateur a les permissions nécessaires
    if (!['admin', 'manager', 'employee'].includes(currentUser.role)) {
      console.error('❌ Permissions insuffisantes - Rôle:', currentUser.role);
      alert('Vous n\'avez pas les permissions nécessaires pour accéder à cette page');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }
    
    console.log('📡 Envoi de la requête vers /api/admin/users...');
    const response = await fetch('http://localhost:8000/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Réponse reçue - Status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Token invalide ou expiré (401)');
        const errorData = await response.json().catch(() => ({}));
        console.error('Détails de l\'erreur:', errorData);
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      if (response.status === 403) {
        console.error('❌ Accès refusé (403)');
        const errorData = await response.json().catch(() => ({}));
        console.error('Détails de l\'erreur:', errorData);
        alert('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }
      
      const errorText = await response.text();
      console.error('❌ Erreur serveur:', errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Utilisateurs récupérés avec succès:', data);
    console.log('📊 Nombre d\'utilisateurs:', data.data?.length || 0);
    setUsers(data.data || data);
  } catch (err) {
    console.error('💥 Erreur lors de la récupération des utilisateurs:', err);
    setError(err.message);
    alert('Erreur: ' + err.message);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  // Fonction pour récupérer les données du dashboard
  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Aucun token trouvé');
        return;
      }

      const response = await fetch('http://localhost:8000/api/admin/dashboard/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Session expirée');
          return;
        }
        throw new Error(`Erreur ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        console.log('✅ Données dashboard récupérées:', result.data);
      }
    } catch (error) {
      console.error('Erreur dashboard:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Charger les données du dashboard au montage et quand on revient sur l'onglet dashboard
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const filteredUsers = users.filter(user => {
  // Filtre par terme de recherche
  const matchesSearch = 
    (user.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  
  // Filtre par rôle
  const matchesRole = 
    roleFilter === "all" || 
    (roleFilter === "admin" && user.role === "admin") ||
    (roleFilter === "manager" && user.role === "manager") ||
    (roleFilter === "employee" && user.role === "employee") ||
    (roleFilter === "student" && user.role === "student");
  
  return matchesSearch && matchesRole;
});

  return (
    <div className="min-h-screen bg-muted">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap overflow-hidden">Admin Panel</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Bouton pour réduire/étendre la sidebar sur desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1 rounded-md hover:bg-gray-100 transition-colors"
              title={`${sidebarCollapsed ? "Étendre" : "Réduire"} la sidebar (Ctrl+B)`}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            {/* Bouton fermer sur mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-2 pt-6 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "users", label: "Utilisateurs", icon: Users },
            { id: "menu", label: "Menu", icon: Tag },
            { id: "stock", label: "Stock", icon: Package },
            { id: "events", label: "Événements & Jeux", icon: Calendar },
            { id: "settings", label: "Paramètres", icon: Settings },
          ].map((tab) => (
            <div key={tab.id} className="relative group">
              <button
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false) // Ferme la sidebar sur mobile après sélection
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-lg" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? tab.label : ''}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden">{tab.label}</span>
                )}
              </button>
              {/* Tooltip pour mode collapsé */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  {tab.label}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Version et informations en bas */}
        <div className="mt-auto p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            {!sidebarCollapsed ? (
              <>
                <p className="font-medium">Mon Miam Miam</p>
                <p>Admin v1.0.0</p>
              </>
            ) : (
              <div className="w-6 h-6 bg-primary/20 rounded mx-auto flex items-center justify-center">
                <Shield className="w-3 h-3 text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <div className={`min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
      }`}>
        {/* Header mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Administration</h1>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Contenu de la page */}
        <div className="p-4 lg:p-8 pt-6 lg:pt-8">
          {/* Header pour desktop */}
          <div className="hidden lg:flex items-center justify-between mb-8 pt-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-800">Administration</h1>
              <p className="text-gray-600">Gestion complète du système</p>
            </div>
            {/* Indicateur du statut de la sidebar */}
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {sidebarCollapsed ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>Sidebar réduite</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sidebar étendue</span>
                </>
              )}
            </div>
          </div>

        {activeTab === "dashboard" && (
          <div className="mt-4 lg:mt-0">
            {/* System Alerts
            <FadeInOnScroll>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 mb-8 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center">
                  <Bell className="w-6 h-6 mr-4" />
                  <div>
                    <h3 className="font-bold text-lg">Alertes Système</h3>
                    <p className="text-sm opacity-90">3 alertes nécessitent votre attention</p>
                  </div>
                </div>
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                  Voir tout
                </button>
              </div>
              </div>
            </FadeInOnScroll> */}

            {/* Global KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isLoadingDashboard ? (
                // Skeleton loading
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))
              ) : dashboardData ? (
                [
                  { 
                    label: 'Utilisateurs Totaux', 
                    value: dashboardData.stats?.utilisateurs_totaux?.total?.toLocaleString() || '0', 
                    change: dashboardData.stats?.utilisateurs_totaux?.label || '', 
                    icon: Users, 
                    color: 'text-primary' 
                  },
                  { 
                    label: 'CA Total', 
                    value: `${dashboardData.stats?.chiffre_affaire_total?.total?.toLocaleString() || '0'} F`, 
                    change: dashboardData.stats?.chiffre_affaire_total?.label || '', 
                    icon: BarChart3, 
                    color: 'text-green-500' 
                  },
                  { 
                    label: 'Commandes Totales', 
                    value: dashboardData.stats?.commandes_totales?.total?.toLocaleString() || '0', 
                    change: dashboardData.stats?.commandes_totales?.label || '', 
                    icon: Tag, 
                    color: 'text-blue-500' 
                  },
                  { 
                    label: 'Plats Actifs', 
                    value: dashboardData.stats?.plats_actifs?.total?.toString() || '0', 
                    change: dashboardData.stats?.plats_actifs?.statut || 'Stable', 
                    icon: Package, 
                    color: 'text-black' 
                  }
                ].map((kpi, index) => (
                  <FadeInOnScroll key={index} delay={index * 150}>
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                          <p className="text-2xl lg:text-3xl font-bold text-black mt-1">{kpi.value}</p>
                          <p className={`text-sm mt-1 ${kpi.change.includes('+') ? 'text-green-500' : kpi.change.includes('-') ? 'text-red-500' : 'text-gray-500'}`}>
                            {kpi.change.includes('+') && '↗ '}
                            {kpi.change.includes('-') && '↘ '}
                            {kpi.change}
                          </p>
                        </div>
                        <div className={`w-12 h-12 bg-muted rounded-lg flex items-center justify-center`}>
                          <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                        </div>
                      </div>
                    </div>
                  </FadeInOnScroll>
                ))
              ) : (
                // Données par défaut si pas encore chargées
                [
                  { label: 'Utilisateurs Totaux', value: '0', change: 'Chargement...', icon: Users, color: 'text-primary' },
                  { label: 'CA Total', value: '0 F', change: 'Chargement...', icon: BarChart3, color: 'text-green-500' },
                  { label: 'Commandes Totales', value: '0', change: 'Chargement...', icon: Tag, color: 'text-blue-500' },
                  { label: 'Plats Actifs', value: '0', change: 'Chargement...', icon: Package, color: 'text-black' }
                ].map((kpi, index) => (
                  <FadeInOnScroll key={index} delay={index * 150}>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                          <p className="text-2xl lg:text-3xl font-bold text-black mt-1">{kpi.value}</p>
                          <p className="text-gray-500 text-sm mt-1">{kpi.change}</p>
                        </div>
                        <div className={`w-12 h-12 bg-muted rounded-lg flex items-center justify-center`}>
                          <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                        </div>
                      </div>
                    </div>
                  </FadeInOnScroll>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-6">Accès Rapide</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('menu')} className="bg-primary text-secondary p-4 rounded-xl hover:opacity-90 transition-all text-center">
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Nouveau Plat</p>
                  </button>
                  <button onClick={() => setActiveTab('promotions')} className="bg-orange-500 text-white p-4 rounded-xl hover:opacity-90 transition-all text-center">
                    <Tag className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Promotion</p>
                  </button>
                  <button onClick={() => setActiveTab('users')} className="bg-blue-500 text-white p-4 rounded-xl hover:opacity-90 transition-all text-center">
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Utilisateur</p>
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="bg-black text-white p-4 rounded-xl hover:opacity-90 transition-all text-center">
                    <Settings className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Paramètres</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-6">Activité Récente</h3>
                <div className="space-y-4">
                  {[
                    { icon: Plus, color: 'bg-green-500', text: 'Nouveau plat ajouté', time: 'Il y a 2h' },
                    { icon: Edit, color: 'bg-primary', text: 'Promotion modifiée', time: 'Il y a 4h' },
                    { icon: Users, color: 'bg-blue-500', text: 'Utilisateur activé', time: 'Il y a 6h' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                      <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center mr-3`}>
                        <activity.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-6">État du Système</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Serveur Principal', status: 'En ligne', statusColor: 'bg-green-500' },
                    { label: 'Base de données', status: 'Optimal', statusColor: 'bg-green-500' },
                    { label: 'Paiements', status: 'Maintenance', statusColor: 'bg-yellow-500' },
                    { label: 'Notifications', status: 'Actif', statusColor: 'bg-green-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className={`${item.statusColor} text-white px-2 py-1 rounded-full text-xs`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-6">Performance Globale</h3>
                <div className="h-80">
                  <canvas ref={performanceChartRef}></canvas>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-6">Répartition Utilisateurs</h3>
                <div className="h-80">
                  <canvas ref={usersChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
  <div className="mt-4 lg:mt-0">
    {/* Header avec bouton Ajouter */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h2>
        <p className="text-gray-600">Gérez tous les utilisateurs et employés</p>
      </div>
      <button
        onClick={() => {
          resetUserForm();
          setShowUserModal(true);
        }}
        className="flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
      >
        <Plus className="w-5 h-5" />
        Ajouter un utilisateur
      </button>
    </div>

    {/* Barre de recherche et filtres */}
    <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: "all", label: "Tous" },
            { value: "student", label: "Étudiants" },
            { value: "employee", label: "Employés" },
            { value: "manager", label: "Managers" },
            { value: "admin", label: "Admins" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setRoleFilter(value)}
              className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                roleFilter === value
                  ? "bg-primary text-secondary"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Tableau des utilisateurs */}
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Chargement des utilisateurs...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          <p>Erreur: {error}</p>
          <button 
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Inscrit le</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{user.prenom} {user.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.code_parrainage || 'Aucun code'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.statut === 'actif' ? 'Compte actif' : 'Compte inactif'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-amber-100 text-amber-800' :
                      user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.telephone || 'Non renseigné'}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditUserModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.statut === 'actif' ? (
                        <button
                          onClick={() => handleSuspendUser(user)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                          title="Suspendre"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Activer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.type)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}

        {activeTab === "promotions" && (
          <div className="mt-4 lg:mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestion des promotions</h2>
              <button
                onClick={() => setShowPromoModal(true)}
                className="bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter une promotion
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <div key={promo.id} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        promo.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {promo.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="bg-muted rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Réduction</p>
                    <p className="text-2xl font-bold text-primary">{promo.discount} F</p>
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    <p>
                      Du {new Date(promo.startDate).toLocaleDateString("fr-FR")} au{" "}
                      {new Date(promo.endDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePromoStatus(promo.id)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                        promo.active
                          ? "bg-muted text-foreground hover:bg-muted/80"
                          : "bg-success/20 text-success hover:bg-success/30"
                      }`}
                    >
                      {promo.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => openEditPromoModal(promo)}
                      className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

                {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Gestion du menu</h2>
              <button
                onClick={() => {
                  resetMenuForm();
                  setShowMenuItemModal(true);
                }}
                className="bg-[#cfbd97] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors flex items-center gap-2"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#cfbd97]"></div>
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
                          <span className="text-lg sm:text-xl font-bold text-[#cfbd97]">{item.prix} FCFA</span>
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

        {activeTab === "stock" && (
          <div className="mt-4 lg:mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestion du Stock</h2>
            </div>

            {isLoadingStock ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Chargement du stock...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistiques du stock */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Articles</p>
                        <p className="text-2xl font-bold">{stockItems.length}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">En Rupture</p>
                        <p className="text-2xl font-bold text-red-600">
                          {stockItems.filter(item => item.stock?.en_rupture).length}
                        </p>
                      </div>
                      <Ban className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Alerte Stock</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {stockItems.filter(item => item.stock?.alerte_stock).length}
                        </p>
                      </div>
                      <Bell className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Disponibles</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stockItems.filter(item => item.disponible && !item.stock?.en_rupture).length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Tableau du stock */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Article</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Catégorie</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Quantité</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Seuil d'alerte</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Statut</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {stockItems.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                  {item.image && (
                                    <img src={item.image} alt={item.nom} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">{item.nom}</p>
                                  <p className="text-sm text-gray-500">{item.prix} FCFA</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.categorie?.nom || 'Sans catégorie'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-lg font-bold ${
                                item.stock?.en_rupture ? 'text-red-600' :
                                item.stock?.alerte_stock ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {item.stock?.quantite_disponible ?? 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-gray-600">
                                {item.stock?.seuil_alerte ?? 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.stock?.en_rupture ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Rupture
                                </span>
                              ) : item.stock?.alerte_stock ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Alerte
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  OK
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditStockModal(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Modifier le stock"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const quantite = prompt('Quantité à ajouter (nombre positif) ou retirer (nombre négatif):');
                                    if (quantite !== null && quantite !== '') {
                                      const ajustement = parseInt(quantite);
                                      if (!isNaN(ajustement)) {
                                        const raison = prompt('Raison de l\'ajustement (optionnel):');
                                        handleAdjustStock(item.id, ajustement, raison || '');
                                      }
                                    }
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Ajuster le stock"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {stockItems.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun article trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de modification du stock */}
        {showStockModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6">
                  Modifier le stock - {editingStock?.nom}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantité disponible</label>
                    <input
                      type="number"
                      min="0"
                      value={stockFormData.quantite_disponible}
                      onChange={(e) => setStockFormData({...stockFormData, quantite_disponible: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Seuil d'alerte</label>
                    <input
                      type="number"
                      min="0"
                      value={stockFormData.seuil_alerte}
                      onChange={(e) => setStockFormData({...stockFormData, seuil_alerte: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Ex: 10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Une alerte sera déclenchée quand la quantité atteint ce seuil
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowStockModal(false);
                      resetStockForm();
                    }}
                    className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateStock}
                    className="flex-1 bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="mt-4 lg:mt-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">Gestion des Événements, Promotions & Jeux</h2>
                <p className="text-muted-foreground">Créez et gérez tous vos événements depuis une seule interface</p>
              </div>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  resetEventForm();
                  setShowEventFormModal(true);
                }}
                className="bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvel Événement
              </button>
            </div>

            {/* Filtres par type */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setEventTypeFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  eventTypeFilter === 'all' 
                    ? 'bg-primary text-secondary' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setEventTypeFilter('promotion')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  eventTypeFilter === 'promotion' 
                    ? 'bg-primary text-secondary' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Gift className="w-4 h-4 inline mr-2" />
                Promotions
              </button>
              <button
                onClick={() => setEventTypeFilter('jeu')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  eventTypeFilter === 'jeu' 
                    ? 'bg-primary text-secondary' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Gamepad2 className="w-4 h-4 inline mr-2" />
                Jeux
              </button>
              <button
                onClick={() => setEventTypeFilter('evenement')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  eventTypeFilter === 'evenement' 
                    ? 'bg-primary text-secondary' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Événements
              </button>
            </div>

            {/* Statistiques */}
            <FadeInOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Événements</p>
                      <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Actifs</p>
                      <p className="text-2xl font-bold">{events.filter(e => e.active === 'oui').length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Promotions</p>
                      <p className="text-2xl font-bold">{events.filter(e => e.type === 'promotion').length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jeux</p>
                      <p className="text-2xl font-bold">{events.filter(e => e.type === 'jeu').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInOnScroll>

            {/* Liste des événements */}
            {isLoadingEvents ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement des événements...</p>
              </div>
            ) : events.filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
                <p className="text-muted-foreground text-lg">Aucun événement trouvé</p>
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    resetEventForm();
                    setShowEventFormModal(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Créer un événement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events
                  .filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter)
                  .map((event, index) => (
                  <FadeInOnScroll key={event.id_evenement} delay={index * 100}>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      {/* Image/Affiche */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                        {event.url_affiche ? (
                          <img
                            src={event.url_affiche.startsWith('http') ? event.url_affiche : `http://localhost:8000${event.url_affiche}`}
                            alt={event.titre}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {event.type === 'promotion' && <Gift className="w-16 h-16 text-primary" />}
                            {event.type === 'jeu' && <Gamepad2 className="w-16 h-16 text-primary" />}
                            {event.type === 'evenement' && <Calendar className="w-16 h-16 text-primary" />}
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold">
                            {event.type === 'promotion' && 'Promotion'}
                            {event.type === 'jeu' && 'Jeu'}
                            {event.type === 'evenement' && 'Événement'}
                          </span>
                          {event.is_integrated && (
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                              <Gamepad2 className="w-3 h-3" />
                              Intégré
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleEvent(event.id_evenement)}
                            className={`p-2 rounded-full transition-colors ${
                              event.active === 'oui'
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                            }`}
                            title={`${event.active === 'oui' ? 'Désactiver' : 'Activer'}`}
                          >
                            {event.active === 'oui' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg line-clamp-2">{event.titre}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            event.active === 'oui' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {event.active === 'oui' ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{event.description || 'Aucune description'}</p>
                        
                        <div className="space-y-2 mb-4 text-sm">
                          {event.code_promo && (
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-primary" />
                              <span className="font-mono font-semibold">{event.code_promo}</span>
                            </div>
                          )}
                          {event.valeur_remise && (
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-primary" />
                              <span>
                                {event.type_remise === 'pourcentage' && `-${event.valeur_remise}%`}
                                {event.type_remise === 'fixe' && `-${event.valeur_remise} FCFA`}
                                {event.type_remise === 'point_bonus' && `+${event.valeur_remise} points`}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">
                              {new Date(event.date_debut).toLocaleDateString('fr-FR')} - {new Date(event.date_fin).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {event.limite_utilisation > 0 && (
                            <div className="text-xs text-gray-500">
                              Limite: {event.nombre_utilisation || 0} / {event.limite_utilisation}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditEventModal(event)}
                            className="flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            title={event.is_integrated ? 'Modifier limite et points' : 'Modifier'}
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => !event.is_integrated && handleDeleteEvent(event.id_evenement)}
                            disabled={event.is_integrated}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                              event.is_integrated
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title={event.is_integrated ? 'Les jeux intégrés ne peuvent pas être supprimés' : 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
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

        {activeTab === "settings" && (
          <div className="mt-4 lg:mt-0">
            <h2 className="text-2xl font-bold mb-8">Paramètres du Système</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-6">Informations du Restaurant</h3>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom du restaurant</label>
                    <input 
                      type="text" 
                      defaultValue="Mon Miam Miam" 
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                    <input 
                      type="tel" 
                      defaultValue="+237 123 456 789" 
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Adresse</label>
                    <textarea 
                      rows="3" 
                      defaultValue="Campus Universitaire, Yaoundé, Cameroun"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all"
                  >
                    Sauvegarder
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-6">Configuration Fidélité</h3>
                <form className="space-y-6">
                  <div className="bg-muted p-4 rounded-xl">
                    <h4 className="font-semibold mb-4">Conversion F → Points</h4>
                    <div className="flex items-center space-x-3">
                      <input type="number" defaultValue="1000" className="w-20 px-3 py-2 border border-border rounded-lg text-center text-sm" />
                      <span className="text-sm">F =</span>
                      <input type="number" defaultValue="10" className="w-20 px-3 py-2 border border-border rounded-lg text-center text-sm" />
                      <span className="text-sm">points</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-xl">
                    <h4 className="font-semibold mb-4">Conversion Points → F</h4>
                    <div className="flex items-center space-x-3">
                      <input type="number" defaultValue="15" className="w-20 px-3 py-2 border border-border rounded-lg text-center text-sm" />
                      <span className="text-sm">points =</span>
                      <input type="number" defaultValue="1000" className="w-20 px-3 py-2 border border-border rounded-lg text-center text-sm" />
                      <span className="text-sm">F</span>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all"
                  >
                    Sauvegarder
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Configuration Modal */}
      {showGameConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">
                {editingGame ? "Modifier le Jeu" : "Nouveau Mini-Jeu"}
              </h3>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du jeu</label>
                <input
                  type="text"
                  name="name"
                  value={gameFormData.name}
                  onChange={handleGameFormChange}
                  className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Roue de la Fortune"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={gameFormData.description}
                  onChange={handleGameFormChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Description du jeu..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type de jeu</label>
                <select
                  name="type"
                  value={gameFormData.type}
                  onChange={handleGameFormChange}
                  className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="wheel">Roue de la Fortune</option>
                  <option value="quiz">Quiz</option>
                  <option value="memory">Jeu de Mémoire</option>
                  <option value="scratch">Carte à Gratter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Points minimum</label>
                  <input
                    type="number"
                    name="minPoints"
                    value={gameFormData.minPoints}
                    onChange={handleGameFormChange}
                    className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Points maximum</label>
                  <input
                    type="number"
                    name="maxPoints"
                    value={gameFormData.maxPoints}
                    onChange={handleGameFormChange}
                    className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Coût de jeu (points)</label>
                  <input
                    type="number"
                    name="costToPlay"
                    value={gameFormData.costToPlay}
                    onChange={handleGameFormChange}
                    className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Limite par jour</label>
                  <input
                    type="number"
                    name="dailyLimit"
                    value={gameFormData.dailyLimit}
                    onChange={handleGameFormChange}
                    className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={gameFormData.active}
                  onChange={handleGameFormChange}
                  className="w-5 h-5 text-primary border-muted rounded focus:ring-primary"
                />
                <label className="text-sm font-medium">Jeu actif</label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowGameConfigModal(false)
                    setEditingGame(null)
                    resetGameForm()
                  }}
                  className="flex-1 px-6 py-3 border border-muted text-muted-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveGame}
                  className="flex-1 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  {editingGame ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {(showUserModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">
                {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
              </h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                editingUser ? handleUpdateUser() : handleCreateUser()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={userFormData.nom}
                  onChange={handleUserFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={userFormData.prenom}
                  onChange={handleUserFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={userFormData.telephone}
                  onChange={handleUserFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <input
                    type="password"
                    name="mot_de_passe"
                    value={userFormData.mot_de_passe}
                    onChange={handleUserFormChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    minLength="8"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  name="type"
                  value={userFormData.type}
                  onChange={(e) => {
                    handleUserFormChange(e);
                    // Mettre à jour le rôle et id_role selon le type
                    const type = e.target.value;
                    if (type === 'user') {
                      setUserFormData(prev => ({ ...prev, role: 'student', id_role: 1 }));
                    } else {
                      setUserFormData(prev => ({ ...prev, role: 'employee', id_role: 2 }));
                    }
                  }}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!!editingUser}
                >
                  <option value="user">Étudiant</option>
                  <option value="employe">Employé</option>
                </select>
              </div>

              {userFormData.type === 'employe' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Rôle</label>
                  <select
                    name="id_role"
                    value={userFormData.id_role}
                    onChange={(e) => {
                      handleUserFormChange(e);
                      // Mettre à jour le rôle textuel
                      const idRole = parseInt(e.target.value);
                      const roleMap = { 1: 'student', 2: 'employee', 3: 'manager', 4: 'admin' };
                      setUserFormData(prev => ({ ...prev, role: roleMap[idRole] }));
                    }}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="2">Employé</option>
                    <option value="3">Manager</option>
                    <option value="4">Administrateur</option>
                  </select>
                </div>
              )}

              {userFormData.type === 'user' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Localisation</label>
                  <input
                    type="text"
                    name="localisation"
                    value={userFormData.localisation}
                    onChange={handleUserFormChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false)
                    setEditingUser(null)
                    resetUserForm()
                  }}
                  className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  {editingUser ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {(showPromoModal || editingPromo) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{editingPromo ? "Modifier la promotion" : "Ajouter une promotion"}</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                editingPromo ? handleEditPromo() : handleAddPromo()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={promoFormData.title}
                  onChange={handlePromoFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={promoFormData.description}
                  onChange={handlePromoFormChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Réduction (F)</label>
                <input
                  type="number"
                  name="discount"
                  value={promoFormData.discount}
                  onChange={handlePromoFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date de début</label>
                <input
                  type="date"
                  name="startDate"
                  value={promoFormData.startDate}
                  onChange={handlePromoFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date de fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={promoFormData.endDate}
                  onChange={handlePromoFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={promoFormData.active}
                  onChange={handlePromoFormChange}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Promotion active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPromoModal(false)
                    setEditingPromo(null)
                    resetPromoForm()
                  }}
                  className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  {editingPromo ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Add/Edit Menu Item Modal */}
      {showMenuItemModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowMenuItemModal(false)
            setEditingMenuItem(null)
            resetMenuForm()
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
                e.preventDefault()
                editingMenuItem ? handleUpdateMenuItem() : handleCreateMenuItem()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Nom du plat *</label>
                <input
                  type="text"
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97] resize-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                    setShowMenuItemModal(false)
                    setEditingMenuItem(null)
                    resetMenuForm()
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#cfbd97] text-black py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors"
                >
                  {editingMenuItem ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Form Modal - Gestion Événements/Promotions/Jeux */}
      {showEventFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">
                {editingEvent ? "Modifier l'événement" : "Nouvel Événement"}
              </h3>
            </div>
            
            <form 
              className="space-y-4" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                handleCreateOrUpdateEvent(); 
              }}
            >
              {/* Type d'événement */}
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  name="type"
                  value={eventFormData.type}
                  onChange={handleEventFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="evenement">Événement</option>
                  <option value="promotion">Promotion</option>
                  <option value="jeu">Jeu (Blackjack, Quiz)</option>
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium mb-2">Titre *</label>
                <input 
                  type="text" 
                  name="titre"
                  value={eventFormData.titre}
                  onChange={handleEventFormChange}
                  placeholder="Ex: Blackjack, Quiz Culinaire, -20% sur Ndolé" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  required 
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  name="description"
                  value={eventFormData.description}
                  onChange={handleEventFormChange}
                  placeholder="Décrivez l'événement, jeu ou promotion..." 
                  rows="3" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                ></textarea>
              </div>

              {/* Code promo (pour promotions) */}
              {eventFormData.type === 'promotion' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Code Promo</label>
                  <input 
                    type="text" 
                    name="code_promo"
                    value={eventFormData.code_promo}
                    onChange={handleEventFormChange}
                    placeholder="Ex: PROMO20" 
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary uppercase"
                  />
                </div>
              )}

              {/* Type de remise et valeur */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type de remise</label>
                  <select
                    name="type_remise"
                    value={eventFormData.type_remise}
                    onChange={handleEventFormChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="pourcentage">Pourcentage</option>
                    <option value="fixe">Montant fixe</option>
                    <option value="point_bonus">Points bonus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valeur</label>
                  <input 
                    type="number" 
                    name="valeur_remise"
                    value={eventFormData.valeur_remise}
                    onChange={handleEventFormChange}
                    placeholder="Ex: 20" 
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date de début *</label>
                  <input 
                    type="date" 
                    name="date_debut"
                    value={eventFormData.date_debut}
                    onChange={handleEventFormChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date de fin *</label>
                  <input 
                    type="date" 
                    name="date_fin"
                    value={eventFormData.date_fin}
                    onChange={handleEventFormChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    required 
                  />
                </div>
              </div>

              {/* Limite d'utilisation */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Limite d'utilisation 
                  <span className="text-xs text-gray-500 ml-2">
                    (0 = illimité, pour jeux = max/jour/user)
                  </span>
                </label>
                <input 
                  type="number" 
                  name="limite_utilisation"
                  value={eventFormData.limite_utilisation}
                  onChange={handleEventFormChange}
                  placeholder="0" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  min="0"
                />
              </div>

              {/* Upload affiche */}
              <div>
                <label className="block text-sm font-medium mb-2">Affiche (image)</label>
                <input 
                  type="file" 
                  name="affiche"
                  onChange={handleEventFormChange}
                  accept="image/*"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (max 3MB)</p>
              </div>

              {/* Statut actif */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={eventFormData.active === 'oui'}
                  onChange={(e) => handleEventFormChange({
                    target: { name: 'active', value: e.target.checked ? 'oui' : 'non' }
                  })}
                  className="w-5 h-5"
                />
                <label htmlFor="active" className="text-sm font-medium cursor-pointer">
                  Activer immédiatement (les étudiants pourront voir cet événement)
                </label>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEventFormModal(false);
                    resetEventForm();
                  }}
                  className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  {editingEvent ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modification Jeux Intégrés (Blackjack, Quiz) */}
      {showIntegratedGameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Modifier {integratedGameData.titre}</h3>
                <p className="text-sm text-muted-foreground">Jeu intégré - Modification limitée</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Limite d'utilisation */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Limite d'utilisation (parties/jour) *
                </label>
                <input 
                  type="number" 
                  name="limite_utilisation"
                  value={integratedGameData.limite_utilisation}
                  onChange={handleIntegratedGameChange}
                  min="1"
                  max="20"
                  placeholder="Ex: 3" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nombre de fois qu'un étudiant peut jouer par jour
                </p>
              </div>

              {/* Valeur remise (points) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Points gagnables *
                </label>
                <input 
                  type="number" 
                  name="valeur_remise"
                  value={integratedGameData.valeur_remise}
                  onChange={handleIntegratedGameChange}
                  min="1"
                  max="500"
                  placeholder="Ex: 50" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Points de fidélité que l'étudiant peut gagner
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  name="description"
                  value={integratedGameData.description}
                  onChange={handleIntegratedGameChange}
                  placeholder="Description du jeu..." 
                  rows="3" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Les jeux intégrés ne peuvent pas être supprimés. 
                  Seuls la limite, les points et la description peuvent être modifiés.
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowIntegratedGameModal(false)}
                  className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveIntegratedGame}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
