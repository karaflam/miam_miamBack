"use client"

import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Menu, X, User, LogOut, Home, ShoppingBag, Users, BarChart3, Settings, ChevronDown } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
    setIsOpen(false)
    setShowUserMenu(false)
  }

  const getDashboardLink = () => {
    if (!user) return null

    const links = {
      student: { path: "/student", icon: ShoppingBag, label: "Mon Espace" },
      employee: { path: "/employee", icon: Users, label: "Espace Employé" },
      manager: { path: "/manager", icon: BarChart3, label: "Espace Manager" },
      admin: { path: "/admin", icon: Settings, label: "Administration" },
    }

    return links[user.role]
  }

  const dashboardLink = getDashboardLink()

  return (
    <nav className="bg-secondary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-secondary font-bold text-xl">M</span>
            </div>
            <img src="" alt="" />
            <span className="font-bold text-xl">Mon Miam Miam</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Accueil
            </Link>

            {user ? (
              <>
                {dashboardLink && (
                  <Link
                    to={dashboardLink.path}
                    className="hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <dashboardLink.icon className="w-4 h-4" />
                    {dashboardLink.label}
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full hover:bg-primary/30 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-secondary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Link>

              {user ? (
                <>
                  {dashboardLink && (
                    <Link
                      to={dashboardLink.path}
                      onClick={() => setIsOpen(false)}
                      className="hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <dashboardLink.icon className="w-4 h-4" />
                      {dashboardLink.label}
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/20 rounded-lg">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="hover:text-primary transition-colors flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="bg-primary text-secondary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-center"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
