"use client"

import { useState } from "react"
import { mockUsers } from "../../data/mockData"
import { Users, Edit, Trash2, Plus, Search, UserCog } from "lucide-react"

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState(
    mockUsers.filter(user => user.role === "employee" || user.role === "manager")
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    balance: 0,
    loyaltyPoints: 0,
  })

  const filteredEmployees = employees.filter((user) => {
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

  const handleAddEmployee = () => {
    const newEmployee = {
      id: Date.now().toString(),
      ...userFormData,
      password: "password",
      createdAt: new Date().toISOString(),
    }
    setEmployees([...employees, newEmployee])
    setShowUserModal(false)
    resetUserForm()
  }

  const handleEditEmployee = () => {
    setEmployees(employees.map((user) => (user.id === editingUser.id ? { ...user, ...userFormData } : user)))
    setEditingUser(null)
    resetUserForm()
  }

  const handleDeleteEmployee = (userId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      setEmployees(employees.filter((user) => user.id !== userId))
    }
  }

  const resetUserForm = () => {
    setUserFormData({
      name: "",
      email: "",
      phone: "",
      role: "employee",
      balance: 0,
      loyaltyPoints: 0,
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "manager":
        return "bg-yellow-500/20 text-yellow-700"
      case "employee":
        return "bg-[#cfbd97]/20 text-[#b5a082]"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
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

  return (
    <div>
      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "Tous" },
              { value: "employee", label: "Employés" },
              { value: "manager", label: "Managers" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRoleFilter(value)}
                className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  roleFilter === value
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-[#cfbd97] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Employé</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Rôle</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#cfbd97]/20 rounded-full flex items-center justify-center">
                        <span className="font-bold text-[#cfbd97]">{employee.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.phone || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{employee.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(employee.role)}`}
                    >
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditUserModal(employee)}
                        className="p-2 hover:bg-[#cfbd97]/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-[#cfbd97]" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {(showUserModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#cfbd97]/20 rounded-full flex items-center justify-center">
                <UserCog className="w-6 h-6 text-[#cfbd97]" />
              </div>
              <h3 className="text-2xl font-bold">
                {editingUser ? "Modifier l'employé" : "Ajouter un employé"}
              </h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                editingUser ? handleEditEmployee() : handleAddEmployee()
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rôle</label>
                <select
                  name="role"
                  value={userFormData.role}
                  onChange={handleUserFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfbd97]"
                >
                  <option value="employee">Employé</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false)
                    setEditingUser(null)
                    resetUserForm()
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#cfbd97] text-black py-3 rounded-lg font-semibold hover:bg-[#b5a082] transition-colors"
                >
                  {editingUser ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}