"use client"

import { useState, useEffect, useRef } from "react"
import { Chart } from 'chart.js/auto'
import { mockOrders as initialOrders, mockUsers, mockPromotions as initialPromotions } from "../data/mockData"
import { 
  DollarSign, TrendingUp, Users, ShoppingBag, Plus, Edit, Eye, EyeOff, 
  BarChart3, Package, UserPlus, AlertCircle, Clock, CheckCircle, 
  XCircle, Bell, Settings, Calendar, TrendingDown, Activity,
  MessageSquare, Award, Gift, RefreshCw, Search, Filter, Trash2, UserCog, Tag, Ban, X
} from "lucide-react"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
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
  
  // États pour la gestion du stock
  const [stockItems, setStockItems] = useState([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockFormData, setStockFormData] = useState({
    quantite_disponible: '',
    seuil_alerte: '5'
  });
  
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [promotions, setPromotions] = useState(initialPromotions)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [users, setUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userFormData, setUserFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "employee",
    password: "",
    localisation: ""
  })
  const [promoFormData, setPromoFormData] = useState({
    title: "",
    description: "",
    discount: "",
    active: true,
    startDate: "",
    endDate: "",
  })
  const [employees, setEmployees] = useState([])
  const [complaints, setComplaints] = useState([])
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Plats",
    available: true,
  })



  // Références pour les graphiques
  const salesChartRef = useRef(null)
  const popularItemsChartRef = useRef(null)
  const chartInstances = useRef({})

  // Initialisation des graphiques
  useEffect(() => {
    // Nettoyer les graphiques existants
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy()
    })

    if (activeTab === "dashboard") {
      // Graphique des ventes
      if (salesChartRef.current) {
        chartInstances.current.sales = new Chart(salesChartRef.current, {
          type: 'line',
          data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
              label: 'Ventes (F)',
              data: [420000, 380000, 450000, 520000, 680000, 890000, 650000],
              borderColor: '#cfbd97',
              backgroundColor: 'rgba(207, 189, 151, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#cfbd97',
              pointBorderColor: '#fff',
              pointBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                  label: function(context) {
                    return context.parsed.y.toLocaleString() + ' F'
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString() + ' F'
                  }
                }
              }
            }
          }
        })
      }

      // Graphique des plats populaires
      if (popularItemsChartRef.current) {
        chartInstances.current.popularItems = new Chart(popularItemsChartRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Burger Classic', 'Salade César', 'Wrap Poulet', 'Pizza Margherita', 'Autres'],
            datasets: [{
              data: [127, 89, 76, 54, 98],
              backgroundColor: ['#cfbd97', '#000000', '#e8dcc0', '#b5a082', '#f5f5f5'],
              borderWidth: 2,
              borderColor: '#fff',
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: window.innerWidth < 640 ? 'bottom' : 'right',
                labels: {
                  padding: 10,
                  font: {
                    size: 11
                  }
                }
              }
            }
          }
        })
      }
    }

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy()
      })
    }
  }, [activeTab])

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const activeOrders = orders.filter(o => o.status !== "completed").length
  const totalCustomers = mockUsers.filter((u) => u.role === "student").length
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const urgentComplaints = complaints.filter(c => c.status === "urgent").length

  const recentOrders = orders.slice(0, 10)

  const topSellingItems = menuItems
    .map((item) => {
      const orderCount = orders.reduce((count, order) => {
        const itemInOrder = order.items.find((i) => i.menuItemId === item.id)
        return count + (itemInOrder ? itemInOrder.quantity : 0)
      }, 0)
      return { ...item, orderCount }
    })
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5)

  const toggleAvailability = (itemId) => {
    setMenuItems(menuItems.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item)))
  }

  // Fonction updateOrderStatus déplacée plus bas avec intégration backend

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleUserFormChange = (e) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({
      ...prev,
      [name]: name === "balance" || name === "loyaltyPoints" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.prenom || ''} ${employee.nom || ''}`.toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = fullName.includes(search) || email.includes(search);
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  })

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      ...formData,
      price: Number.parseInt(formData.price),
      image: "/placeholder.svg?height=200&width=300",
      isPromotion: false,
    }
    setMenuItems([...menuItems, newItem])
    setShowAddModal(false)
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Plats",
      available: true,
    })
  }

  const handleEditItem = () => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              price: Number.parseInt(formData.price),
            }
          : item,
      ),
    )
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Plats",
      available: true,
    })
  }

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

  // Fonctions pour récupérer les commandes
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/staff/commandes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Erreur commandes:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fonctions pour récupérer les réclamations
  const fetchComplaints = async () => {
    setIsLoadingComplaints(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/staff/reclamations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Erreur réclamations:', error);
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/staff/commandes/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        alert('Statut mis à jour avec succès!');
        fetchOrders(); // Recharger les commandes
      } else {
        alert('Erreur: ' + (data.message || 'Impossible de mettre à jour le statut'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  // Mettre à jour le statut d'une réclamation
  const updateComplaintStatus = async (complaintId, newStatus, commentaire = '') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/staff/reclamations/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          statut: newStatus,
          commentaire_resolution: commentaire 
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Statut mis à jour avec succès!');
        fetchComplaints(); // Recharger les réclamations
      } else {
        alert('Erreur: ' + (data.message || 'Impossible de mettre à jour le statut'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  useEffect(() => {
    if (activeTab === "menu") {
      fetchCategories();
      fetchMenuItems();
    }
    if (activeTab === "employees") {
      fetchUsers();
    }
    if (activeTab === "stock") {
      fetchStockItems();
    }
    if (activeTab === "orders") {
      fetchOrders();
    }
    if (activeTab === "complaints") {
      fetchComplaints();
    }
  }, [activeTab, selectedCategory, searchMenuTerm, roleFilter, searchTerm]);

  // Fonctions de gestion des utilisateurs/employés
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem('auth_token');
      let url = 'http://localhost:8000/api/admin/users';
      const params = new URLSearchParams();
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
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
        // Filtrer pour exclure les admins (le gérant ne doit pas voir les admins)
        const filteredUsers = data.data ? data.data.filter(user => user.role !== 'admin') : [];
        setUsers(filteredUsers);
        // Séparer les employés pour la section employees
        setEmployees(filteredUsers.filter(u => u.role === 'employee' || u.role === 'manager'));
      }
    } catch (error) {
      console.error('Erreur utilisateurs:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
        body: JSON.stringify({
          nom: userFormData.nom,
          prenom: userFormData.prenom,
          email: userFormData.email,
          telephone: userFormData.telephone,
          password: userFormData.password,
          role: userFormData.role,
          localisation: userFormData.localisation || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || JSON.stringify(errorData.errors)));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur créé avec succès!');
      setShowUserModal(false);
      resetUserForm();
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const updateData = {
        nom: userFormData.nom,
        prenom: userFormData.prenom,
        email: userFormData.email,
        telephone: userFormData.telephone,
        role: userFormData.role,
        localisation: userFormData.localisation || null
      };
      
      // Ajouter le mot de passe seulement s'il est fourni
      if (userFormData.password) {
        updateData.password = userFormData.password;
      }

      const response = await fetch(`http://localhost:8000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || JSON.stringify(errorData.errors)));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur modifié avec succès!');
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.prenom} ${user.nom} ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Impossible de supprimer l\'utilisateur'));
        return;
      }

      const data = await response.json();
      alert(data.message || 'Utilisateur supprimé avec succès!');
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

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
      alert(data.message);
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
      alert(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'activation de l\'utilisateur');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      role: user.role,
      password: '',
      localisation: user.localisation || ''
    });
    setShowUserModal(true);
  };

  const resetUserForm = () => {
    setUserFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: 'employee',
      password: '',
      localisation: ''
    });
    setEditingUser(null);
  };

  // Fonctions de gestion des promotions
  const handlePromoFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setPromoFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "discount" ? Number.parseInt(value) || 0 : value,
    }))
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

  const getRoleLabel = (role) => {
    switch (role) {
      case "manager":
        return "Manager"
      case "employee":
        return "Employé"
      default:
        return role
    }
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
    })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "livree":
      case "completed":
        return "bg-green-500/20 text-green-700"
      case "prete":
        return "bg-blue-500/20 text-blue-700"
      case "en_preparation":
      case "preparing":
        return "bg-yellow-500/20 text-yellow-700"
      case "en_attente":
      case "pending":
        return "bg-orange-500/20 text-orange-700"
      case "annulee":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case "livree":
      case "completed":
        return "Livrée"
      case "prete":
        return "Prête"
      case "en_preparation":
      case "preparing":
        return "En préparation"
      case "en_attente":
      case "pending":
        return "En attente"
      case "annulee":
        return "Annulée"
      default:
        return status
    }
  }

  const getEmployeeStatusColor = (status) => {
    switch(status) {
      case "online":
        return "bg-green-500"
      case "pause":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
              <span className="text-[#cfbd97] font-bold text-lg">MM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-black">Mon Miam Miam</h1>
              <p className="text-xs text-gray-600">Espace Direction</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "orders", label: "Commandes", icon: ShoppingBag, badge: activeOrders },
              { id: "menu", label: "Menu", icon: Tag },
              { id: "stock", label: "Stock", icon: Package },
              { id: "promotions", label: "Promotions", icon: Gift, badge: promotions.filter(p => p.active).length },
              { id: "employees", label: "Employés", icon: Users, badge: employees.length },
              { id: "complaints", label: "Réclamations", icon: MessageSquare, badge: urgentComplaints },
              { id: "statistics", label: "Statistiques", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id ? "text-white bg-black" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm">{tab.label}</span>
                </div>
                {tab.badge > 0 && (
                  <span className="bg-[#cfbd97] text-white px-2 py-1 text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#cfbd97] flex items-center justify-center rounded-full">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-black text-sm">Alexandre Martin</p>
              <p className="text-xs text-gray-600">Gérant</p>
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-[#cfbd97]" />
              {urgentComplaints > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {urgentComplaints}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "orders" && "Gestion des Commandes"}
                {activeTab === "menu" && "Gestion du Menu"}
                {activeTab === "promotions" && "Gestion des Promotions"}
                {activeTab === "employees" && "Gestion des Employés"}
                {activeTab === "complaints" && "Gestion des Réclamations"}
                {activeTab === "statistics" && "Statistiques Détaillées"}
              </h2>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xl font-bold text-black">{totalRevenue.toLocaleString()} F</div>
                <div className="text-xs text-gray-600">CA Aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-black">{totalOrders}</div>
                <div className="text-xs text-gray-600">Commandes</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center rounded">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#cfbd97]" />
                  </div>
                  <span className="text-xs sm:text-sm text-green-600 font-semibold">+15.2%</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-black mb-1">{totalRevenue.toLocaleString()} F</div>
                <div className="text-xs sm:text-sm text-gray-600">CA jour</div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#cfbd97] flex items-center justify-center rounded">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-blue-600 font-semibold">+8.1%</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-black mb-1">{totalOrders}</div>
                <div className="text-xs sm:text-sm text-gray-600">Commandes</div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center rounded">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#cfbd97]" />
                  </div>
                  <span className="text-xs sm:text-sm text-orange-600 font-semibold">12 min</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-black mb-1">{activeOrders}</div>
                <div className="text-xs sm:text-sm text-gray-600">Actives</div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#cfbd97] flex items-center justify-center rounded">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-red-600 font-semibold">Urgent</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-black mb-1">{urgentComplaints}</div>
                <div className="text-xs sm:text-sm text-gray-600">Réclamations</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <FadeInOnScroll delay={0}>
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-base sm:text-lg font-bold text-black mb-4">Ventes de la semaine</h3>
                  <div className="h-48 sm:h-64">
                    <canvas ref={salesChartRef}></canvas>
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-base sm:text-lg font-bold text-black mb-4">Top plats populaires</h3>
                  <div className="h-48 sm:h-64">
                    <canvas ref={popularItemsChartRef}></canvas>
                  </div>
                </div>
              </FadeInOnScroll>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Employees */}
              <FadeInOnScroll delay={0}>
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-black">Équipe ({employees.length} employés)</h3>
                  <button 
                    onClick={() => setActiveTab("employees")}
                    className="bg-[#cfbd97] text-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-[#b5a082] rounded transition-colors"
                  >
                    + Gérer
                  </button>
                </div>
                <div className="space-y-3">
                  {employees.slice(0, 3).map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#cfbd97] flex items-center justify-center rounded flex-shrink-0">
                          <span className="text-white text-sm font-bold">{emp.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-black text-sm">{emp.name}</p>
                          <p className="text-xs text-gray-600">{getRoleLabel(emp.role)}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 sm:w-3 sm:h-3 ${getEmployeeStatusColor(emp.status)} rounded-full flex-shrink-0`}></span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setActiveTab("employees")}
                  className="w-full mt-4 text-[#cfbd97] font-semibold py-2 text-sm border border-[#cfbd97] hover:bg-[#cfbd97] hover:text-white rounded transition-colors"
                >
                  Voir tous les employés
                </button>
                </div>
              </FadeInOnScroll>

              {/* Complaints */}
              <FadeInOnScroll delay={200}>
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-black">Réclamations récentes</h3>
                  <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-semibold rounded">
                    {urgentComplaints} non traitées
                  </span>
                </div>
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div 
                      key={complaint.id}
                      className={`p-3 sm:p-4 border-l-4 rounded-r hover:shadow transition-all ${
                        complaint.status === "urgent" 
                          ? "border-red-500 bg-red-50" 
                          : "border-yellow-500 bg-yellow-50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <p className="font-semibold text-black text-sm">
                          Commande #{complaint.orderId} - {complaint.customerName}
                        </p>
                        <span className="text-xs text-gray-600">{complaint.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2">"{complaint.message}"</p>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        complaint.status === "urgent" 
                          ? "bg-red-600 text-white" 
                          : "bg-yellow-600 text-white"
                      }`}>
                        {complaint.status === "urgent" ? "URGENT" : "EN COURS"}
                      </span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setActiveTab("complaints")}
                  className="w-full mt-4 text-[#cfbd97] font-semibold py-2 text-sm border border-[#cfbd97] hover:bg-[#cfbd97] hover:text-white rounded transition-colors"
                >
                  Gérer toutes les réclamations
                </button>
                </div>
              </FadeInOnScroll>
            </div>

            {/* Loyalty & Referral Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <FadeInOnScroll delay={0}>
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-base sm:text-lg font-bold text-black mb-4">Programme fidélité</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-[#cfbd97]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#cfbd97]">12,847</div>
                    <div className="text-xs sm:text-sm text-gray-600">Points distribués</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-black" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-black">8,234</div>
                    <div className="text-xs sm:text-sm text-gray-600">Points utilisés</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-base sm:text-lg font-bold text-black mb-4">Performance parrainage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-center mb-2">
                      <Gift className="w-5 h-5 text-[#cfbd97]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#cfbd97]">47</div>
                    <div className="text-xs sm:text-sm text-gray-600">Nouveaux parrainés</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="w-5 h-5 text-black" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-black">234,000 F</div>
                    <div className="text-xs sm:text-sm text-gray-600">Bonus distribués</div>
                  </div>
                </div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Gestion des Commandes</h2>
              <div className="flex items-center gap-3">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Toutes les commandes</option>
                  <option>En attente</option>
                  <option>En préparation</option>
                  <option>Terminées</option>
                </select>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cfbd97] mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des commandes...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune commande pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">#{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.statut)}`}>
                            {getStatusLabel(order.statut)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {order.utilisateur?.prenom} {order.utilisateur?.nom}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(order.date_commande).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-2xl font-bold text-[#cfbd97]">
                          {(order.montant_final || order.montant_total || 0).toLocaleString()} FCFA
                        </p>
                        <div className="flex gap-2">
                          {order.statut === "en_attente" && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, "en_preparation")
                              }}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600"
                            >
                              Préparer
                            </button>
                          )}
                          {order.statut === "en_preparation" && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, "prete")
                              }}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
                            >
                              Prête
                            </button>
                          )}
                          {order.statut === "prete" && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, "livree")
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                            >
                              Livrée
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

        {/* Stock Tab */}
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

        {/* Promotions Tab */}
        {activeTab === "promotions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestion des promotions</h2>
              <button
                onClick={() => setShowPromoModal(true)}
                className="bg-[#cfbd97] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors flex items-center gap-2"
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
                      <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        promo.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {promo.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Réduction</p>
                    <p className="text-2xl font-bold text-[#cfbd97]">{promo.discount} F</p>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
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
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {promo.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => openEditPromoModal(promo)}
                      className="px-4 py-2 bg-[#cfbd97] text-black rounded-lg hover:bg-[#b5a082] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Gestion des Employés</h2>
              <button
                onClick={() => {
                  resetUserForm();
                  setShowUserModal(true);
                }}
                className="bg-[#cfbd97] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                Ajouter un employé
              </button>
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
              >
                <option value="all">Tous les rôles</option>
                <option value="student">Étudiants</option>
                <option value="employee">Employés</option>
                <option value="manager">Gérants</option>
              </select>
            </div>

            {/* Liste des utilisateurs */}
            {isLoadingUsers ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#cfbd97]"></div>
                <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date création
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-[#cfbd97] rounded-full flex items-center justify-center text-white font-bold">
                                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.prenom} {user.nom}
                                </div>
                                {user.localisation && (
                                  <div className="text-sm text-gray-500">{user.localisation}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            {user.telephone && (
                              <div className="text-sm text-gray-500">{user.telephone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'manager' ? 'Gérant' : 
                               user.role === 'employee' ? 'Employé' : 
                               'Étudiant'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.statut === 'actif' ? 'Actif' : 'Suspendu'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {user.statut === 'actif' ? (
                                <button
                                  onClick={() => handleSuspendUser(user)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Suspendre"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Activer"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Gestion des Réclamations</h2>
                <p className="text-sm text-gray-600">{urgentComplaints} réclamations urgentes</p>
              </div>
              <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                <option>Toutes les réclamations</option>
                <option>Urgentes</option>
                <option>En cours</option>
                <option>Résolues</option>
              </select>
            </div>

            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">Commande #{complaint.orderId}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.status === "urgent" 
                            ? "bg-red-600 text-white" 
                            : "bg-yellow-600 text-white"
                        }`}>
                          {complaint.status === "urgent" ? "URGENT" : "EN COURS"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{complaint.customerName}</p>
                      <p className="text-sm text-gray-700 italic">"{complaint.message}"</p>
                    </div>
                    <span className="text-xs text-gray-500">{complaint.time}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Valider la réponse
                    </button>
                    <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
                      Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Statistiques Détaillées</h2>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <Activity className="w-16 h-16 text-[#cfbd97] mx-auto mb-4" />
              <p className="text-gray-600">Section statistiques en développement</p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Add/Edit Menu Item Modal */}
      {(showAddModal || editingItem) && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6">
              {editingItem ? "Modifier l'article" : "Ajouter un article"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                editingItem ? handleEditItem() : handleAddItem()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prix (F)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                >
                  <option value="Plats">Plats</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={formData.available}
                  onChange={handleFormChange}
                  className="w-4 h-4"
                />
                <label htmlFor="available" className="text-sm font-medium">
                  Disponible
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingItem(null)
                    setFormData({
                      name: "",
                      description: "",
                      price: "",
                      category: "Plats",
                      available: true,
                    })
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#cfbd97] text-black py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors"
                >
                  {editingItem ? "Modifier" : "Ajouter"}
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
              <div className="w-12 h-12 bg-[#cfbd97]/20 rounded-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-[#cfbd97]" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97] resize-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#cfbd97] text-black py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors"
                >
                  {editingPromo ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowUserModal(false);
            setEditingUser(null);
            resetUserForm();
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6">
              {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingUser ? handleUpdateUser() : handleCreateUser();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={userFormData.prenom}
                    onChange={(e) => setUserFormData({...userFormData, prenom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <input
                    type="text"
                    value={userFormData.nom}
                    onChange={(e) => setUserFormData({...userFormData, nom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={userFormData.telephone}
                  onChange={(e) => setUserFormData({...userFormData, telephone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  placeholder="+237 6XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rôle *</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  required
                >
                  <option value="student">Étudiant</option>
                  <option value="employee">Employé</option>
                  <option value="manager">Gérant</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Vous ne pouvez pas créer d'administrateurs
                </p>
              </div>

              {userFormData.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Localisation</label>
                  <input
                    type="text"
                    value={userFormData.localisation}
                    onChange={(e) => setUserFormData({...userFormData, localisation: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                    placeholder="Ex: Campus Ngoa Ekelle"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  required={!editingUser}
                  minLength="6"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    resetUserForm();
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#cfbd97] text-black py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors"
                >
                  {editingUser ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}


