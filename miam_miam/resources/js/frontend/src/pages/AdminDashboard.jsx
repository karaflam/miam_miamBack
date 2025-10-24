"use client"

import { useState, useEffect, useRef } from "react"
import { Chart } from 'chart.js/auto'
import { mockUsers as initialUsers, mockPromotions as initialPromotions, mockMenuItems as initialMenuItems } from "../data/mockData"
import { Users, Tag, Edit, Trash2, Plus, Search, UserCog, BarChart3, Settings, Bell, Shield, FileText, Gamepad2, Trophy, Play, Pause, RotateCcw, Menu, X, Home, ChevronLeft, ChevronRight , Eye, EyeOff, Package, Calendar, TrendingUp} from "lucide-react"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [users, setUsers] = useState(initialUsers)
  const [promotions, setPromotions] = useState(initialPromotions)
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showMenuItemModal, setShowMenuItemModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingPromo, setEditingPromo] = useState(null)
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [showGameConfigModal, setShowGameConfigModal] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Références pour les graphiques
  const performanceChartRef = useRef(null)
  const usersChartRef = useRef(null)
  const chartInstances = useRef({})

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    balance: 0,
    loyaltyPoints: 0,
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
    name: "",
    description: "",
    price: "",
    category: "Plats",
    available: true,
  })

  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    maxParticipants: "",
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

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

  const handleMenuFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setMenuFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleEventFormChange = (e) => {
    const { name, value } = e.target
    setEventFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddUser = () => {
    const newUser = {
      id: Date.now().toString(),
      ...userFormData,
      password: "password",
      createdAt: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    setShowUserModal(false)
    resetUserForm()
  }

  const handleEditUser = () => {
    setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...userFormData } : user)))
    setEditingUser(null)
    resetUserForm()
  }

  const handleDeleteUser = (userId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

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
      name: "",
      email: "",
      phone: "",
      role: "student",
      balance: 0,
      loyaltyPoints: 0,
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

  const resetMenuForm = () => {
    setMenuFormData({
      name: "",
      description: "",
      price: "",
      category: "Plats",
      available: true,
    })
  }

  const handleAddMenuItem = () => {
    if (menuFormData.name && menuFormData.description && menuFormData.price) {
      const newItem = {
        id: Date.now(),
        name: menuFormData.name,
        description: menuFormData.description,
        price: parseInt(menuFormData.price),
        category: menuFormData.category,
        available: menuFormData.available,
        image: "/placeholder.svg"
      }
      setMenuItems([...menuItems, newItem])
      setShowMenuItemModal(false)
      resetMenuForm()
    }
  }

  const handleEditMenuItem = () => {
    if (editingMenuItem && menuFormData.name && menuFormData.description && menuFormData.price) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingMenuItem.id 
          ? {
              ...item,
              name: menuFormData.name,
              description: menuFormData.description,
              price: parseInt(menuFormData.price),
              category: menuFormData.category,
              available: menuFormData.available
            }
          : item
      ))
      setShowMenuItemModal(false)
      setEditingMenuItem(null)
      resetMenuForm()
    }
  }

  const handleDeleteMenuItem = (menuItemId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) {
      setMenuItems(menuItems.filter((item) => item.id !== menuItemId))
    }
  }

  const resetEventForm = () => {
    setEventFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      maxParticipants: "",
    })
  }

  // Initialisation des graphiques
  useEffect(() => {
    // Nettoyer les graphiques existants
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });

    if (activeTab === 'dashboard') {
      // Graphique de performance
      if (performanceChartRef.current) {
        chartInstances.current.performance = new Chart(performanceChartRef.current, {
          type: 'line',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
            datasets: [
              {
                label: 'Chiffre d\'affaires (F)',
                data: [320000, 380000, 420000, 410000, 450000, 480000],
                borderColor: '#cfbd97',
                backgroundColor: 'rgba(207, 189, 151, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Commandes',
                data: [280, 320, 360, 340, 380, 420],
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
      if (usersChartRef.current) {
        chartInstances.current.users = new Chart(usersChartRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Étudiants', 'Employés', 'Managers', 'Admins'],
            datasets: [{
              data: [1847, 542, 98, 20],
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
      }
    }

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [activeTab]);

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
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      balance: user.balance || 0,
      loyaltyPoints: user.loyaltyPoints || 0,
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
            { id: "promotions", label: "Promotions", icon: Tag },
            { id: "games", label: "Mini-Jeux", icon: Gamepad2 },
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
            {/* System Alerts */}
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
            </FadeInOnScroll>

            {/* Global KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Utilisateurs Totaux', value: '2,847', change: '+18% ce mois', icon: Users, color: 'text-primary' },
                { label: 'CA Total', value: '478,920 F', change: '+24% ce mois', icon: BarChart3, color: 'text-green-500' },
                { label: 'Commandes Totales', value: '5,234', change: '+12% ce mois', icon: Tag, color: 'text-blue-500' },
                { label: 'Plats Actifs', value: '24', change: 'Stable', icon: Tag, color: 'text-black' }
              ].map((kpi, index) => (
                <FadeInOnScroll key={index} delay={index * 150}>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                        <p className="text-2xl lg:text-3xl font-bold text-black mt-1">{kpi.value}</p>
                        <p className="text-green-500 text-sm mt-1">
                          ↗ {kpi.change}
                        </p>
                      </div>
                      <div className={`w-12 h-12 bg-muted rounded-lg flex items-center justify-center`}>
                        <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
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
            {/* Filters and Search */}
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
                <div className="flex gap-2">
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
                <button
                  onClick={() => setShowUserModal(true)}
                  className="bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Rôle</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Solde</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Points</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="font-bold text-primary">{user.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.phone || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">{user.balance || 0} F</td>
                        <td className="px-6 py-4 text-sm font-semibold">{user.loyaltyPoints || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-primary" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Gestion du menu</h2>
              <button
                onClick={() => setShowMenuItemModal(true)}
                className="bg-[#cfbd97] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Ajouter un article
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {menuItems.map((item) => (
                <FadeInOnScroll key={item.id}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Indisponible</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold mb-1">{item.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-[#cfbd97]">{item.price.toLocaleString()} F</p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">{item.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setMenuItems(prev => prev.map(menuItem => 
                              menuItem.id === item.id 
                                ? { ...menuItem, available: !menuItem.available }
                                : menuItem
                            ))
                          }}
                          className={`flex-1 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm ${
                            item.available
                              ? "bg-gray-200 text-black hover:bg-gray-300"
                              : "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                          }`}
                        >
                          {item.available ? (
                            <>
                              <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                              Masquer
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              Afficher
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingMenuItem(item)
                            setMenuFormData({
                              name: item.name,
                              description: item.description,
                              price: item.price.toString(),
                              category: item.category,
                              available: item.available,
                            })
                            setShowMenuItemModal(true)
                          }}
                          className="px-3 sm:px-4 py-2 bg-[#cfbd97] text-black rounded-lg hover:bg-[#b5a082] transition-colors"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        )}

        {activeTab === "games" && (
          <div className="mt-4 lg:mt-0">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold">Gestion des Mini-Jeux</h2>
                <p className="text-muted-foreground">Configurez et gérez les jeux disponibles pour vos clients</p>
              </div>
              <button
                onClick={() => {
                  setEditingGame(null)
                  resetGameForm()
                  setShowGameConfigModal(true)
                }}
                className="bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau Jeu
              </button>
            </div>

            {/* Statistiques des jeux */}
            <FadeInOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jeux Actifs</p>
                      <p className="text-2xl font-bold">{games.filter(g => g.active).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parties Jouées</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Points Distribués</p>
                      <p className="text-2xl font-bold">45,680</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joueurs Actifs</p>
                      <p className="text-2xl font-bold">324</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInOnScroll>

            {/* Liste des jeux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game, index) => (
                <FadeInOnScroll key={game.id} delay={index * 150}>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          game.active ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Gamepad2 className={`w-6 h-6 ${
                            game.active ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{game.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            game.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {game.active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleGameStatus(game.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          game.active 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {game.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm">{game.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500">Coût de jeu</p>
                        <p className="font-semibold">{game.costToPlay} points</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500">Limite/jour</p>
                        <p className="font-semibold">{game.dailyLimit} fois</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500">Points min</p>
                        <p className="font-semibold">{game.minPoints}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500">Points max</p>
                        <p className="font-semibold">{game.maxPoints}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Configurer
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
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
                editingUser ? handleEditUser() : handleAddUser()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  value={userFormData.name}
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
                  name="phone"
                  value={userFormData.phone}
                  onChange={handleUserFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rôle</label>
                <select
                  name="role"
                  value={userFormData.role}
                  onChange={handleUserFormChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="student">Étudiant</option>
                  <option value="employee">Employé</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {userFormData.role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Solde (F)</label>
                    <input
                      type="number"
                      name="balance"
                      value={userFormData.balance}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Points de fidélité</label>
                    <input
                      type="number"
                      name="loyaltyPoints"
                      value={userFormData.loyaltyPoints}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                    />
                  </div>
                </>
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
                editingMenuItem ? handleEditMenuItem() : handleAddMenuItem()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={menuFormData.name}
                  onChange={handleMenuFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={menuFormData.description}
                  onChange={handleMenuFormChange}
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
                  value={menuFormData.price}
                  onChange={handleMenuFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <select
                  name="category"
                  value={menuFormData.category}
                  onChange={handleMenuFormChange}
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
                  checked={menuFormData.available}
                  onChange={handleMenuFormChange}
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

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold">Nouvel Événement</h3>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowEventModal(false); }}>
              <div>
                <label className="block text-sm font-medium mb-2">Titre de l'événement</label>
                <input 
                  type="text" 
                  name="title"
                  value={eventFormData.title}
                  onChange={handleEventFormChange}
                  placeholder="Ex: Soirée Quiz Étudiante" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  name="description"
                  value={eventFormData.description}
                  onChange={handleEventFormChange}
                  placeholder="Décrivez l'événement..." 
                  rows="3" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={eventFormData.date}
                    onChange={handleEventFormChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Heure</label>
                  <input 
                    type="time" 
                    name="time"
                    value={eventFormData.time}
                    onChange={handleEventFormChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Participants max</label>
                <input 
                  type="number" 
                  name="maxParticipants"
                  value={eventFormData.maxParticipants}
                  onChange={handleEventFormChange}
                  placeholder="50" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEventModal(false);
                    resetEventForm();
                  }}
                  className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Créer l'événement
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
