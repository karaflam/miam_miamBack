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
      // Token expiré ou invalide
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
      window.location.href = '/student-login'
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

// Services de profil
export const profileService = {
  async getProfile() {
    try {
      const response = await api.get('/profile')
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
      const response = await api.put('/profile', profileData)
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
      const response = await api.put('/profile/password', passwordData)
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

export default api
