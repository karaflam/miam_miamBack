"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    const result = login(email, password)

    if (result.success) {
      const dashboardPaths = {
        student: "/student",
        employee: "/employee",
        manager: "/manager",
        admin: "/admin",
      }
      navigate(dashboardPaths[result.user.role])
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-secondary font-bold text-2xl">M</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Connexion</h1>
            <p className="text-muted-foreground">Accédez à votre espace Mon Miam Miam</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error text-error rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">Comptes de test :</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>Étudiant: student@test.com / password</p>
              <p>Employé: employee@test.com / password</p>
              <p>Manager: manager@test.com / password</p>
              <p>Admin: admin@test.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
