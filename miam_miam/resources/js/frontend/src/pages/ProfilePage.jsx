"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { profileService } from "../services/api"
import { User, Mail, Phone, MapPin, Lock, Save, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [activeSection, setActiveSection] = useState("info")
  const isStaff = user && ['admin', 'manager', 'employee'].includes(user.role)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    localisation: "",
  })
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleInfoChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    // Effacer l'erreur du champ modifié
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  // Charger le profil au montage du composant
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true)
      const result = await profileService.getProfile()
      if (result.success) {
        setFormData({
          nom: result.data.nom || "",
          prenom: result.data.prenom || "",
          email: result.data.email || "",
          telephone: result.data.telephone || "",
          localisation: result.data.localisation || "",
        })
      }
      setLoadingProfile(false)
    }
    loadProfile()
  }, [])

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setFieldErrors({})
    setLoading(true)

    const result = await profileService.updateProfile(formData)
    
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      // Mettre à jour le contexte utilisateur
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          name: `${formData.prenom} ${formData.nom}`,
          email: formData.email,
        }))
      }
    } else {
      setMessage({ type: "error", text: result.error })
      if (result.errors) {
        setFieldErrors(result.errors)
      }
    }
    
    setLoading(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setFieldErrors({})

    if (passwordData.password !== passwordData.password_confirmation) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" })
      return
    }

    if (passwordData.password.length < 8) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères" })
      return
    }

    setLoading(true)

    const result = await profileService.updatePassword(passwordData)
    
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      })
    } else {
      setMessage({ type: "error", text: result.error })
      if (result.errors) {
        setFieldErrors(result.errors)
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-secondary p-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <p className="text-secondary/80">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex">
              <button
                onClick={() => setActiveSection("info")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeSection === "info"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Informations personnelles
              </button>
              <button
                onClick={() => setActiveSection("password")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeSection === "password"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mot de passe
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-error/10 border border-error text-error"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {loadingProfile ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <>
                {activeSection === "info" && (
                  <form onSubmit={handleUpdateInfo} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
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
                        onChange={handleInfoChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          fieldErrors.prenom ? "border-error focus:ring-error" : "border-border focus:ring-primary"
                        }`}
                        required
                      />
                    </div>
                    {fieldErrors.prenom && (
                      <p className="text-xs text-error mt-1">{fieldErrors.prenom[0]}</p>
                    )}
                  </div>

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
                        onChange={handleInfoChange}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
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
                      onChange={handleInfoChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
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
                      onChange={handleInfoChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0612345678"
                    />
                  </div>
                </div>

                {!isStaff && (
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
                        onChange={handleInfoChange}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Dakar, Sénégal"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </form>
            )}

            {activeSection === "password" && (
              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="current_password"
                      name="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Minimum 8 caractères</p>
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type="password"
                      value={passwordData.password_confirmation}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Modification..." : "Modifier le mot de passe"}
                </button>
              </form>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
