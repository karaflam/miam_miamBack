"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    // Rediriger vers la page de connexion appropriée selon le rôle demandé
    const isStaffRoute = allowedRoles?.some(role => ['employee', 'manager', 'admin'].includes(role))
    return <Navigate to={isStaffRoute ? "/staff-login" : "/student-login"} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
