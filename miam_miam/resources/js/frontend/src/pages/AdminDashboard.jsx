"use client"

import { useState } from "react"
import { mockUsers as initialUsers, mockPromotions as initialPromotions } from "../data/mockData"
import { Users, Tag, Edit, Trash2, Plus, Search, UserCog } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState(initialUsers)
  const [promotions, setPromotions] = useState(initialPromotions)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingPromo, setEditingPromo] = useState(null)

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administration</h1>
          <p className="text-muted-foreground">Gestion complète du système</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-x-auto">
          <div className="flex gap-2 p-2 min-w-max">
            {[
              { id: "users", label: "Utilisateurs", icon: Users },
              { id: "promotions", label: "Promotions", icon: Tag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id ? "bg-primary text-secondary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "users" && (
          <div>
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
          <div>
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
      </div>

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
    </div>
  )
}
