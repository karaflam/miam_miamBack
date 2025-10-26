"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService, staffAuthService } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for saved user session
    const savedUser = localStorage.getItem("currentUser")
    const token = localStorage.getItem("auth_token")
    
    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      
      // Note: On ne vérifie pas le token ici pour éviter les erreurs 500
      // Le token sera vérifié lors des requêtes API protégées
      // Si le token est invalide, l'intercepteur axios nettoiera la session
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const result = await authService.login(email, password)
    
    if (result.success) {
      setUser(result.user)
      return { success: true, user: result.user }
    }

    return { success: false, error: result.error }
  }

  const register = async (userData) => {
    const result = await authService.register(userData)
    
    if (result.success) {
      setUser(result.user)
      return { success: true, user: result.user }
    }

    return { success: false, error: result.error, errors: result.errors }
  }

  const logout = async () => {
    // Déterminer quel service utiliser selon le rôle
    const isStaff = user && ['admin', 'manager', 'employee'].includes(user.role)
    const service = isStaff ? staffAuthService : authService
    
    await service.logout()
    setUser(null)
  }

  const updateBalance = (amount) => {
    if (user) {
      const updatedUser = { ...user, balance: user.balance + amount }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const updateLoyaltyPoints = (points) => {
    if (user) {
      const updatedUser = { ...user, loyaltyPoints: user.loyaltyPoints + points }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const refreshUser = async () => {
    try {
      const result = await authService.getCurrentUser()
      if (result.success) {
        setUser(result.user)
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateBalance,
        updateLoyaltyPoints,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
