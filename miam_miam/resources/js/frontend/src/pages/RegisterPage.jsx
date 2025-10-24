"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { User, Mail, Lock, Phone, AlertCircle, MapPin, Gift } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    password_confirmation: "",
    telephone: "",
    localisation: "",
    code_parrain: "",
  })
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [e.target.name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setLoading(true)

    try {
      const result = await register(formData)

      if (result.success) {
        navigate("/student")
      } else {
        setError(result.error || "Une erreur est survenue lors de l'inscription")
        if (result.errors) {
          setFieldErrors(result.errors)
        }
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
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
            <h1 className="text-3xl font-bold mb-2">Inscription</h1>
            <p className="text-muted-foreground">Créez votre compte Mon Miam Miam</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error text-error rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium mb-2">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      fieldErrors.nom ? "border-error" : "border-border"
                    }`}
                    placeholder="Dupont"
                    required
                    disabled={loading}
                  />
                </div>
                {fieldErrors.nom && (
                  <p className="text-xs text-error mt-1">{fieldErrors.nom[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="prenom" className="block text-sm font-medium mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      fieldErrors.prenom ? "border-error" : "border-border"
                    }`}
                    placeholder="Jean"
                    required
                    disabled={loading}
                  />
                </div>
                {fieldErrors.prenom && (
                  <p className="text-xs text-error mt-1">{fieldErrors.prenom[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.email ? "border-error" : "border-border"
                  }`}
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-error mt-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.telephone ? "border-error" : "border-border"
                  }`}
                  placeholder="0612345678"
                  required
                  disabled={loading}
                />
              </div>
              {fieldErrors.telephone && (
                <p className="text-xs text-error mt-1">{fieldErrors.telephone[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="localisation" className="block text-sm font-medium mb-2">
                Localisation
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="localisation"
                  name="localisation"
                  type="text"
                  value={formData.localisation}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.localisation ? "border-error" : "border-border"
                  }`}
                  placeholder="Dakar, Sénégal"
                  required
                  disabled={loading}
                />
              </div>
              {fieldErrors.localisation && (
                <p className="text-xs text-error mt-1">{fieldErrors.localisation[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="code_parrain" className="block text-sm font-medium mb-2">
                Code parrain (optionnel)
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="code_parrain"
                  name="code_parrain"
                  type="text"
                  value={formData.code_parrain}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.code_parrain ? "border-error" : "border-border"
                  }`}
                  placeholder="ABC12345"
                  disabled={loading}
                />
              </div>
              {fieldErrors.code_parrain && (
                <p className="text-xs text-error mt-1">{fieldErrors.code_parrain[0]}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Gagnez des points bonus avec un code parrain
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.password ? "border-error" : "border-border"
                  }`}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-error mt-1">{fieldErrors.password[0]}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Déjà un compte ?{" "}
              <Link to="/student-login" className="text-primary font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
