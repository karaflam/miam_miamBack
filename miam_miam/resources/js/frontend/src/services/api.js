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

export default api
