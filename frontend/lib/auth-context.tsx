"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  location: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - in production, this would call an API
    const mockUser: User = {
      id: "1",
      email,
      name: "John Doe",
      phone: "+33612345678",
      location: "Paris",
      role: "student",
      loyaltyPoints: 12,
      referralCode: "JOHN123",
      createdAt: new Date(),
    }

    localStorage.setItem("user", JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const register = async (data: RegisterData) => {
    // Mock registration - in production, this would call an API
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      role: "student",
      loyaltyPoints: 0,
      referralCode: data.name.substring(0, 4).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase(),
      createdAt: new Date(),
    }

    localStorage.setItem("user", JSON.stringify(newUser))
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
