"use client"

import { useState, useEffect, useRef } from "react"
import { Chart } from 'chart.js/auto'
import { mockMenuItems as initialMenuItems, mockOrders as initialOrders, mockUsers, mockPromotions as initialPromotions } from "../data/mockData"
import EmployeeManagement from "../components/manager/EmployeeManagement"
import { 
  DollarSign, TrendingUp, Users, ShoppingBag, Plus, Edit, Eye, EyeOff, 
  BarChart3, Package, UserPlus, AlertCircle, Clock, CheckCircle, 
  XCircle, Bell, Settings, Calendar, TrendingDown, Activity,
  MessageSquare, Award, Gift, RefreshCw, Search, Filter, Trash2, UserCog, Tag
} from "lucide-react"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [orders, setOrders] = useState(initialOrders)
  const [promotions, setPromotions] = useState(initialPromotions)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
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
  const [employees] = useState([
    {
      id: "1",
      name: "Marie Leroy",
      email: "marie.leroy@email.com",
      role: "employee",
      status: "online"
    },
    {
      id: "2",
      name: "Thomas Dubois",
      email: "thomas.dubois@email.com",
      role: "employee",
      status: "pause"
    },
    {
      id: "3",
      name: "Sophie Bernard",
      email: "sophie.bernard@email.com",
      role: "employee",
      status: "offline"
    }
  ])
  const [complaints, setComplaints] = useState([
    {
      id: "1",
      orderId: "2847",
      customerName: "Julie Martin",
      message: "Sandwich froid et frites molles",
      status: "urgent",
      time: "Il y a 15 min"
    },
    {
      id: "2",
      orderId: "2845",
      customerName: "Pierre Durand",
      message: "Temps d'attente trop long",
      status: "pending",
      time: "Il y a 1h"
    }
  ])
  
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

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

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
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || employee.role === roleFilter
    return matchesSearch && matchesRole
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
      case "completed":
        return "bg-green-500/20 text-green-700"
      case "preparing":
        return "bg-yellow-500/20 text-yellow-700"
      case "pending":
        return "bg-blue-500/20 text-blue-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case "completed":
        return "Terminée"
      case "preparing":
        return "En préparation"
      case "pending":
        return "En attente"
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
              { id: "menu", label: "Menu", icon: Package },
              { id: "promotions", label: "Promotions", icon: Tag, badge: promotions.filter(p => p.active).length },
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

            <div className="grid grid-cols-1 gap-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">#{order.id.slice(-6)}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{order.userName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-[#cfbd97]">{order.total.toLocaleString()} F</p>
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order.id, "preparing")
                            }}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600"
                          >
                            Préparer
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order.id, "completed")
                            }}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
                          >
                            Terminer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Gestion du menu</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#cfbd97] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Ajouter un article
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
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
                        onClick={() => toggleAvailability(item.id)}
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
                        onClick={() => openEditModal(item)}
                        className="px-3 sm:px-4 py-2 bg-[#cfbd97] text-black rounded-lg hover:bg-[#b5a082] transition-colors"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
        {activeTab === "employees" && <EmployeeManagement />}

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

    </div>
  )
}


