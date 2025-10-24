"use client"

import { useState } from "react"
import { mockOrders as initialOrders } from "../data/mockData"
import { Clock, CheckCircle, Package, TrendingUp, Search } from "lucide-react"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function EmployeeDashboard() {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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
          <h1 className="text-3xl font-bold mb-2">Gestion des commandes</h1>
          <p className="text-muted-foreground">Suivez et gérez toutes les commandes en temps réel</p>
        </div>

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
      </div>
    </div>
  )
}
