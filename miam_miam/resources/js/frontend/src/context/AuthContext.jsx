"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for saved user session
    const savedUser = localStorage.getItem("currentUser")
    const token = localStorage.getItem("auth_token")
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
      // Optionnel: vérifier que le token est toujours valide
      authService.getCurrentUser().then(result => {
        if (result.success) {
          setUser(result.user)
        } else {
          setUser(null)
          localStorage.removeItem("currentUser")
          localStorage.removeItem("auth_token")
        }
      })
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
    await authService.logout()
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
