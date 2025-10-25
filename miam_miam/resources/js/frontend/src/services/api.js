import axios from 'axios'

// Configuration de base d'axios
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important pour les cookies CSRF
})

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - nettoyer le localStorage seulement
      // Ne pas rediriger automatiquement car staff et student ont des pages différentes
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
    }
    return Promise.reject(error)
  }
)

// Services d'authentification
export const authService = {
  async login(email, password) {
    try {
      // D'abord, obtenir le cookie CSRF
      await axios.get('/sanctum/csrf-cookie')
      
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        // Stocker le token et l'utilisateur
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
        return { success: true, user: response.data.user }
      }
      
      return { success: false, error: 'Erreur de connexion' }
    } catch (error) {
      const message = error.response?.data?.message || 'Email ou mot de passe incorrect'
      return { success: false, error: message }
    }
  },

  async register(userData) {
    try {
      // D'abord, obtenir le cookie CSRF
      await axios.get('/sanctum/csrf-cookie')
      
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        // Stocker le token et l'utilisateur
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
        return { success: true, user: response.data.user }
      }
      
      return { success: false, error: 'Erreur lors de l\'inscription' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription'
      const errors = error.response?.data?.errors || {}
      return { success: false, error: message, errors }
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
      return { success: true }
    } catch (error) {
      // Même en cas d'erreur, on nettoie le localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
      return { success: true }
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user')
      if (response.data.success) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
        return { success: true, user: response.data.user }
      }
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  },

  async forgotPassword(email) {
    try {
      await axios.get('/sanctum/csrf-cookie')
      const response = await api.post('/auth/forgot-password', { email })
      return { success: true, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi du lien'
      return { success: false, error: message }
    }
  },

  async resetPassword(token, email, password, password_confirmation) {
    try {
      await axios.get('/sanctum/csrf-cookie')
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation,
      })
      return { success: true, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la réinitialisation'
      return { success: false, error: message }
    }
  },
}

// Services d'authentification staff (employés)
export const staffAuthService = {
  async login(email, password) {
    try {
      // D'abord, obtenir le cookie CSRF
      await axios.get('/sanctum/csrf-cookie')
      
      const response = await api.post('/staff/login', { email, password })
      
      if (response.data.success) {
        // Stocker le token et l'utilisateur
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
        return { success: true, user: response.data.user }
      }
      
      return { success: false, error: 'Erreur de connexion' }
    } catch (error) {
      const message = error.response?.data?.message || 'Email ou mot de passe incorrect'
      return { success: false, error: message }
    }
  },

  async logout() {
    try {
      await api.post('/staff/logout')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
      return { success: true }
    } catch (error) {
      // Même en cas d'erreur, on nettoie le localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
      return { success: true }
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/staff/user')
      if (response.data.success) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
        return { success: true, user: response.data.user }
      }
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  },
}

// Helper pour déterminer si l'utilisateur est staff
const isStaffUser = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  return ['admin', 'manager', 'employee'].includes(currentUser.role)
}

// Services de profil (détecte automatiquement staff vs student)
export const profileService = {
  async getProfile() {
    try {
      const endpoint = isStaffUser() ? '/staff/profile' : '/profile'
      const response = await api.get(endpoint)
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, error: 'Erreur lors de la récupération du profil' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération du profil'
      return { success: false, error: message }
    }
  },

  async updateProfile(profileData) {
    try {
      const endpoint = isStaffUser() ? '/staff/profile' : '/profile'
      const response = await api.put(endpoint, profileData)
      if (response.data.success) {
        // Mettre à jour l'utilisateur dans le localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const updatedUser = {
          ...currentUser,
          name: `${profileData.prenom} ${profileData.nom}`,
          email: profileData.email,
        }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        return { success: true, message: response.data.message, data: response.data.data }
      }
      return { success: false, error: 'Erreur lors de la mise à jour' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
      const errors = error.response?.data?.errors || {}
      return { success: false, error: message, errors }
    }
  },

  async updatePassword(passwordData) {
    try {
      const endpoint = isStaffUser() ? '/staff/profile/password' : '/profile/password'
      const response = await api.put(endpoint, passwordData)
      if (response.data.success) {
        return { success: true, message: response.data.message }
      }
      return { success: false, error: 'Erreur lors du changement de mot de passe' }
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      const errors = error.response?.data?.errors || {}
      return { success: false, error: message, errors }
    }
  },
}

// Services de parrainage
export const referralService = {
  async getCode() {
    try {
      const response = await api.get('/referral/code')
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, error: 'Erreur lors de la récupération du code' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération du code'
      return { success: false, error: message }
    }
  },

  async getReferrals() {
    try {
      const response = await api.get('/referral/referrals')
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, error: 'Erreur lors de la récupération des filleuls' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération des filleuls'
      return { success: false, error: message }
    }
  },
}

// Services de commandes
export const orderService = {
  /**
   * Créer une nouvelle commande
   * @param {Object} orderData - Données de la commande
   * @param {string} orderData.type_livraison - 'livraison' ou 'sur_place'
   * @param {string} orderData.heure_arrivee - Heure souhaitée (format HH:mm)
   * @param {string} orderData.adresse_livraison - Adresse (si livraison)
   * @param {string} orderData.commentaire_client - Commentaire optionnel
   * @param {Array} orderData.articles - Liste des articles [{id, prix, quantite}]
   */
  async createOrder(orderData) {
    try {
      const response = await api.post('/commandes', orderData)
      if (response.data) {
        return { success: true, data: response.data }
      }
      return { success: false, error: 'Erreur lors de la création de la commande' }
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la création de la commande'
      const errors = error.response?.data?.errors || {}
      return { success: false, error: message, errors }
    }
  },

  /**
   * Récupérer les commandes de l'utilisateur connecté
   */
  async getMyOrders() {
    try {
      const response = await api.get('/commandes/mes-commandes')
      if (response.data.success || response.data.data) {
        return { success: true, data: response.data.data || response.data }
      }
      return { success: false, error: 'Erreur lors de la récupération des commandes' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération des commandes'
      return { success: false, error: message }
    }
  },

  /**
   * Récupérer les détails d'une commande
   * @param {number} orderId - ID de la commande
   */
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/commandes/${orderId}`)
      if (response.data.success || response.data.data) {
        return { success: true, data: response.data.data || response.data }
      }
      return { success: false, error: 'Erreur lors de la récupération des détails' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération des détails'
      return { success: false, error: message }
    }
  },
}

// Services de réclamations
export const claimService = {
  /**
   * Créer une nouvelle réclamation
   * @param {Object} claimData - Données de la réclamation
   * @param {number} claimData.id_commande - ID de la commande concernée (optionnel)
   * @param {string} claimData.type_reclamation - Type de réclamation
   * @param {string} claimData.description - Description détaillée
   * @param {string} claimData.priorite - 'basse', 'moyenne', 'haute'
   */
  async createClaim(claimData) {
    try {
      const response = await api.post('/reclamations', claimData)
      if (response.data.success || response.data.data) {
        return { success: true, data: response.data.data || response.data }
      }
      return { success: false, error: 'Erreur lors de la création de la réclamation' }
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la création de la réclamation'
      const errors = error.response?.data?.errors || {}
      return { success: false, error: message, errors }
    }
  },

  /**
   * Récupérer les réclamations de l'utilisateur connecté
   */
  async getMyClaims() {
    try {
      const response = await api.get('/reclamations/mes-reclamations')
      if (response.data.success || response.data.data) {
        return { success: true, data: response.data.data || response.data }
      }
      return { success: false, error: 'Erreur lors de la récupération des réclamations' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération des réclamations'
      return { success: false, error: message }
    }
  },

  /**
   * Récupérer les détails d'une réclamation
   * @param {number} claimId - ID de la réclamation
   */
  async getClaimDetails(claimId) {
    try {
      const response = await api.get(`/reclamations/${claimId}`)
      if (response.data.success || response.data.data) {
        return { success: true, data: response.data.data || response.data }
      }
      return { success: false, error: 'Erreur lors de la récupération des détails' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération des détails'
      return { success: false, error: message }
    }
  },

  /**
   * Annuler une réclamation
   * @param {number} claimId - ID de la réclamation
   */
  async cancelClaim(claimId) {
    try {
      const response = await api.put(`/reclamations/${claimId}/annuler`)
      if (response.data.success) {
        return { success: true, message: response.data.message }
      }
      return { success: false, error: 'Erreur lors de l\'annulation' }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'annulation'
      return { success: false, error: message }
    }
  },
}

export default api
