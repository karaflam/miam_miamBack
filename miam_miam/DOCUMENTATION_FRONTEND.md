# 📱 Documentation Frontend - Mon Miam Miam

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack Technique](#stack-technique)
3. [Architecture](#architecture)
4. [Installation et Configuration](#installation-et-configuration)
5. [Structure du Projet](#structure-du-projet)
6. [Composants Principaux](#composants-principaux)
7. [Gestion de l'État](#gestion-de-létat)
8. [Services API](#services-api)
9. [Routing et Navigation](#routing-et-navigation)
10. [Authentification et Sécurité](#authentification-et-sécurité)
11. [Charte Graphique](#charte-graphique)
12. [Pages et Fonctionnalités](#pages-et-fonctionnalités)
13. [Optimisation et Performance](#optimisation-et-performance)
14. [Déploiement](#déploiement)
15. [Guide de Maintenance](#guide-de-maintenance)

---

## 🎯 Vue d'ensemble

**Mon Miam Miam** est une application web de commande en ligne pour le restaurant universitaire ZeDuc@Space de l'institut UCAC-ICAM de Yaoundé. L'application frontend est développée avec **React** et **Vite**, offrant une interface moderne, réactive et intuitive.

### Objectifs Principaux
- Faciliter la commande en ligne pour les étudiants
- Gérer un système de fidélité avec points et parrainage
- Permettre aux employés de gérer les commandes et le menu
- Offrir aux administrateurs une vue complète des statistiques

---

## 🛠️ Stack Technique

### Technologies Principales

| Technologie | Version | Utilisation |
|------------|---------|-------------|
| **React** | 18.3.1 | Bibliothèque UI principale |
| **Vite** | 6.0.11 | Build tool et dev server |
| **React Router** | latest | Routing et navigation |
| **Tailwind CSS** | 3.4.0 | Framework CSS utility-first |
| **Axios** | (via services) | Client HTTP pour les API |
| **Lucide React** | 0.454.0 | Bibliothèque d'icônes |
| **Chart.js** | 4.5.1 | Visualisation de données |

### Dépendances Complémentaires

```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "latest",
  "tailwind-merge": "^2.5.5",
  "tailwindcss-animate": "^1.0.7"
}
```

### Outils de Développement

- **TypeScript** : Support TypeScript pour le typage (optionnel)
- **PostCSS** : Traitement CSS avec Autoprefixer
- **@vitejs/plugin-react** : Plugin React pour Vite

---

## 🏗️ Architecture

### Architecture Générale

```
┌─────────────────────────────────────────┐
│           React Application             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌───────────────────┐  │
│  │  Router  │──│  AuthContext      │  │
│  │  (React  │  │  (Global State)   │  │
│  │  Router) │  └───────────────────┘  │
│  └──────────┘                          │
│       │                                 │
│       ▼                                 │
│  ┌─────────────────────────────────┐  │
│  │         Layout                  │  │
│  │  ┌────────┐  ┌──────────────┐  │  │
│  │  │ Navbar │  │    Outlet    │  │  │
│  │  └────────┘  │  (Pages)     │  │  │
│  │              └──────────────┘  │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │      Services API               │  │
│  │  - authService                  │  │
│  │  - orderService                 │  │
│  │  - claimService                 │  │
│  │  - eventService                 │  │
│  └─────────────────────────────────┘  │
│              │                          │
│              ▼                          │
│     Laravel Backend API                │
└─────────────────────────────────────────┘
```

### Patterns Architecturaux Utilisés

1. **Component-Based Architecture** : Composants React réutilisables
2. **Context API Pattern** : Gestion d'état global pour l'authentification
3. **Service Layer Pattern** : Séparation de la logique API
4. **Protected Routes Pattern** : Contrôle d'accès basé sur les rôles
5. **Presentational/Container Pattern** : Séparation UI et logique métier

---

## ⚙️ Installation et Configuration

### Prérequis

- **Node.js** : >= 18.x
- **npm** ou **pnpm** : Gestionnaire de paquets
- **Backend Laravel** : API backend fonctionnelle

### Installation

```bash
# Naviguer vers le dossier frontend
cd resources/js/frontend

# Installer les dépendances
npm install
# ou
pnpm install

# Lancer le serveur de développement
npm run dev
# ou
pnpm dev
```

### Configuration

#### 1. Variables d'environnement

Créer un fichier `.env` à la racine du projet frontend :

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Mon Miam Miam"
```

#### 2. Configuration Vite (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

#### 3. Configuration Tailwind (`tailwind.config.js`)

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#cfbd97',
          light: '#e0d4b8',
          dark: '#b8a67d',
          // Nuances 50-900
        },
        secondary: {
          DEFAULT: '#000000',
          light: '#333333',
        }
      }
    }
  },
  plugins: []
}
```

---

## 📁 Structure du Projet

```
frontend/
├── public/                      # Fichiers statiques
│   └── placeholder.svg
├── src/
│   ├── components/              # Composants réutilisables
│   │   ├── Layout.jsx          # Layout principal
│   │   ├── Navbar.jsx          # Barre de navigation
│   │   ├── ProtectedRoute.jsx  # Composant de protection de routes
│   │   ├── CustomCarousel.jsx  # Carousel d'images
│   │   ├── FadeInOnScroll.jsx  # Animation scroll
│   │   ├── CookieBanner.jsx    # Bannière RGPD
│   │   ├── PageTransition.jsx  # Transitions de pages
│   │   └── EventsManagement.jsx # Gestion événements
│   │
│   ├── pages/                   # Pages de l'application
│   │   ├── HomePage.jsx         # Page d'accueil
│   │   ├── StudentLoginPage.jsx
│   │   ├── StaffLoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── ManagerDashboard.jsx
│   │   └── AdminDashboard.jsx
│   │
│   ├── context/                 # Contextes React
│   │   └── AuthContext.jsx     # Contexte d'authentification
│   │
│   ├── services/                # Services API
│   │   └── api.js              # Configuration Axios et services
│   │
│   ├── lib/                     # Utilitaires
│   │   └── utils.js
│   │
│   ├── data/                    # Données statiques
│   │
│   ├── App.jsx                  # Composant racine
│   ├── main.jsx                 # Point d'entrée
│   └── index.css                # Styles globaux
│
├── index.html                   # Template HTML
├── package.json                 # Dépendances npm
├── vite.config.js              # Configuration Vite
├── tailwind.config.js          # Configuration Tailwind
└── postcss.config.js           # Configuration PostCSS
```

---

## 🧩 Composants Principaux

### 1. **Layout** (`components/Layout.jsx`)

Composant wrapper qui contient la structure générale de l'application.

```jsx
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}
```

### 2. **Navbar** (`components/Navbar.jsx`)

Barre de navigation responsive avec menu mobile hamburger.

**Fonctionnalités :**
- Affichage conditionnel selon l'état de connexion
- Navigation adaptée au rôle de l'utilisateur
- Menu déroulant utilisateur
- Version mobile responsive

**Exemple d'utilisation :**

```jsx
// Navigation adaptée au rôle
const getDashboardLink = () => {
  const links = {
    student: { path: "/student", label: "Mon Espace" },
    employee: { path: "/employee", label: "Espace Employé" },
    manager: { path: "/manager", label: "Espace Manager" },
    admin: { path: "/admin", label: "Administration" }
  }
  return links[user.role]
}
```

### 3. **ProtectedRoute** (`components/ProtectedRoute.jsx`)

HOC (Higher Order Component) pour protéger les routes selon les rôles.

```jsx
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  
  if (!user) return <Navigate to="/student-login" />
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}
```

### 4. **CustomCarousel** (`components/CustomCarousel.jsx`)

Carousel d'images pour la page d'accueil avec transition automatique.

**Props :**
- `images` : Tableau d'URLs d'images
- `interval` : Durée entre les transitions (ms)
- `autoplay` : Lecture automatique

### 5. **FadeInOnScroll** (`components/FadeInOnScroll.jsx`)

Composant d'animation au scroll utilisant Intersection Observer.

```jsx
<FadeInOnScroll delay={100}>
  <div className="card">Contenu animé</div>
</FadeInOnScroll>
```

---

## 🔄 Gestion de l'État

### AuthContext

Le contexte d'authentification gère l'état global de l'utilisateur connecté.

**Fichier :** `context/AuthContext.jsx`

#### État Géré

```javascript
{
  user: {
    id: number,
    name: string,
    email: string,
    role: 'student' | 'employee' | 'manager' | 'admin',
    balance: number,
    loyaltyPoints: number
  },
  loading: boolean
}
```

#### Méthodes Disponibles

| Méthode | Description | Paramètres |
|---------|-------------|------------|
| `login(email, password)` | Connexion utilisateur | email, password |
| `register(userData)` | Inscription | userData object |
| `logout()` | Déconnexion | - |
| `updateBalance(amount)` | Mise à jour du solde | amount (number) |
| `updateLoyaltyPoints(points)` | Mise à jour des points | points (number) |
| `refreshUser()` | Rafraîchir les données utilisateur | - |

#### Utilisation

```jsx
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { user, login, logout } = useAuth()

  const handleLogin = async (email, password) => {
    const result = await login(email, password)
    if (result.success) {
      // Redirection
    }
  }

  return (
    <div>
      {user ? (
        <p>Bienvenue {user.name}</p>
      ) : (
        <button onClick={handleLogin}>Se connecter</button>
      )}
    </div>
  )
}
```

#### Persistance de Session

```javascript
// Sauvegarde dans localStorage
localStorage.setItem('auth_token', token)
localStorage.setItem('currentUser', JSON.stringify(user))

// Récupération au chargement
useEffect(() => {
  const savedUser = localStorage.getItem("currentUser")
  const token = localStorage.getItem("auth_token")
  
  if (savedUser && token) {
    setUser(JSON.parse(savedUser))
  }
  setLoading(false)
}, [])
```

---

## 🌐 Services API

### Configuration Axios

**Fichier :** `services/api.js`

#### Instance Axios

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
})
```

#### Intercepteurs

**Request Interceptor :** Ajoute le token JWT

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Response Interceptor :** Gère les erreurs 401

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
    }
    return Promise.reject(error)
  }
)
```

### Services Disponibles

#### 1. **authService** (Étudiants)

```javascript
// Connexion
const result = await authService.login(email, password)

// Inscription
const result = await authService.register({
  nom, prenom, email, password, 
  password_confirmation, telephone, 
  code_parrain
})

// Déconnexion
await authService.logout()

// Mot de passe oublié
await authService.forgotPassword(email)

// Réinitialisation
await authService.resetPassword(token, email, password, password_confirmation)
```

#### 2. **staffAuthService** (Staff)

```javascript
// Connexion staff
const result = await staffAuthService.login(email, password)

// Déconnexion
await staffAuthService.logout()

// User actuel
const result = await staffAuthService.getCurrentUser()
```

#### 3. **profileService**

```javascript
// Récupérer le profil
const result = await profileService.getProfile()

// Mettre à jour le profil
const result = await profileService.updateProfile({
  nom, prenom, email, telephone
})

// Changer le mot de passe
const result = await profileService.updatePassword({
  current_password, password, password_confirmation
})
```

#### 4. **orderService** (Commandes)

```javascript
// Créer une commande
const result = await orderService.createOrder({
  type_livraison: 'livraison' | 'sur_place',
  heure_arrivee: 'HH:mm',
  adresse_livraison: 'string',
  commentaire_client: 'string',
  articles: [{id, prix, quantite}]
})

// Mes commandes
const result = await orderService.getMyOrders()

// Détails commande
const result = await orderService.getOrderDetails(orderId)
```

#### 5. **claimService** (Réclamations)

```javascript
// Créer réclamation
const result = await claimService.createClaim({
  id_commande: number,
  type_reclamation: 'string',
  description: 'string',
  priorite: 'basse' | 'moyenne' | 'haute'
})

// Mes réclamations
const result = await claimService.getMyClaims()

// Détails réclamation
const result = await claimService.getClaimDetails(claimId)

// Annuler
const result = await claimService.cancelClaim(claimId)
```

#### 6. **referralService** (Parrainage)

```javascript
// Code de parrainage
const result = await referralService.getCode()

// Liste des filleuls
const result = await referralService.getReferrals()
```

#### 7. **eventService** (Événements)

```javascript
// Tous les événements
const result = await eventService.getAllEvents()

// Événement par ID
const result = await eventService.getEventById(id)

// Créer (admin)
const result = await eventService.createEvent(eventData)

// Participer
const result = await eventService.participate(eventId)
```

---

## 🗺️ Routing et Navigation

### Configuration des Routes

**Fichier :** `App.jsx`

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    {/* Routes publiques */}
    <Route index element={<HomePage />} />
    <Route path="student-login" element={<StudentLoginPage />} />
    <Route path="staff-login" element={<StaffLoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    
    {/* Routes protégées */}
    <Route path="profile" element={
      <ProtectedRoute allowedRoles={["student", "employee", "manager", "admin"]}>
        <ProfilePage />
      </ProtectedRoute>
    } />
    
    <Route path="student" element={
      <ProtectedRoute allowedRoles={["student"]}>
        <StudentDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="employee" element={
      <ProtectedRoute allowedRoles={["employee"]}>
        <EmployeeDashboard />
      </ProtectedRoute>
    } />
    
    {/* ... autres routes */}
  </Route>
</Routes>
```

### Navigation Programmatique

```javascript
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/student', { replace: true })
  }
}
```

---

## 🔐 Authentification et Sécurité

### Flux d'Authentification

```
┌─────────────┐
│   Utilisateur│
└──────┬──────┘
       │ 1. Login/Register
       ▼
┌──────────────────────────┐
│   AuthService            │
│  - POST /auth/login      │
│  - Reçoit token JWT      │
└──────┬───────────────────┘
       │ 2. Token stocké
       ▼
┌──────────────────────────┐
│   localStorage           │
│  - auth_token            │
│  - currentUser           │
└──────┬───────────────────┘
       │ 3. Requêtes API
       ▼
┌──────────────────────────┐
│   Axios Interceptor      │
│  - Authorization: Bearer │
└──────────────────────────┘
```

### Protection CSRF

```javascript
// Avant chaque requête POST/PUT/DELETE
await axios.get('/sanctum/csrf-cookie')

// Puis requête avec cookie CSRF
const response = await api.post('/endpoint', data)
```

### Sécurité du Token

- **Stockage** : localStorage (considérer httpOnly cookies pour prod)
- **Expiration** : Géré par Laravel Sanctum
- **Refresh** : Automatique via intercepteur 401
- **Nettoyage** : Lors de la déconnexion ou erreur 401

---

## 🎨 Charte Graphique

### Couleurs Principales

```css
/* Primary - Beige doré */
--color-primary: #cfbd97;
--color-primary-light: #e0d4b8;
--color-primary-dark: #b8a67d;

/* Secondary - Noir */
--color-secondary: #000000;
--color-secondary-light: #333333;

/* Couleurs d'état */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### Utilisation avec Tailwind

```jsx
{/* Bouton primaire */}
<button className="bg-primary text-secondary hover:bg-primary-dark">
  Action
</button>

{/* Card avec bordure */}
<div className="border-2 border-primary/20 rounded-xl">
  Contenu
</div>

{/* Gradient */}
<div className="bg-gradient-to-br from-secondary to-primary/20">
  Hero Section
</div>
```

### Typography

```css
--font-sans: "Inter", system-ui, sans-serif;
```

### Spacing et Radius

```css
--radius: 0.5rem;
```

---

## 📄 Pages et Fonctionnalités

### 1. HomePage (Page d'Accueil)

**Sections :**
- Hero avec carousel
- Menu du jour (4 premiers plats disponibles)
- Promotions actives
- Événements à venir
- Top 5 clients du mois
- CTA inscription

**Données chargées :**
```javascript
// Menu
GET /api/menu

// Données homepage
GET /api/home-data
// Retourne: {
//   top_clients,
//   promotions_actives,
//   evenements_a_venir
// }
```

### 2. StudentDashboard

**Onglets principaux :**

#### Vue d'ensemble
- Solde compte
- Points de fidélité
- Commandes en cours
- Statistiques personnelles

#### Commander
- Liste des plats disponibles
- Panier
- Formulaire de commande
- Paiement

#### Mes Commandes
- Historique avec filtres
- Statuts en temps réel
- Détails commandes

#### Points de Fidélité
- Solde actuel
- Historique des gains/dépenses
- Règles du programme

#### Parrainage
- Mon code unique
- Liste des filleuls
- Points gagnés

#### Réclamations
- Créer une réclamation
- Historique
- Suivi statut

### 3. EmployeeDashboard

**Fonctionnalités :**
- Commandes en attente
- Validation commandes
- Gestion menu (CRUD)
- Gestion stock
- Traitement réclamations
- Statistiques du jour

### 4. ManagerDashboard

Toutes les fonctionnalités employé +
- Statistiques avancées
- Gestion événements/promotions
- Rapports hebdomadaires
- Performance équipe

### 5. AdminDashboard

Toutes les fonctionnalités manager +
- Gestion utilisateurs (CRUD employés)
- Configuration système
- Logs et activités
- Export données

---

## ⚡ Optimisation et Performance

### Code Splitting

```javascript
// Lazy loading des pages
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))

<Suspense fallback={<LoadingSpinner />}>
  <StudentDashboard />
</Suspense>
```

### Mémoization

```javascript
// Éviter rerenders inutiles
const MemoizedComponent = React.memo(ExpensiveComponent)

// useMemo pour calculs coûteux
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

### Optimisation Images

```jsx
<img 
  src={image} 
  alt="Description"
  loading="lazy"
  onError={(e) => e.target.src = '/placeholder.svg'}
/>
```

### Debouncing

```javascript
// Pour recherche en temps réel
import { debounce } from 'lodash'

const debouncedSearch = debounce((query) => {
  // API call
}, 300)
```

---

## 🚀 Déploiement

### Build de Production

```bash
npm run build
```

Génère le dossier `dist/` optimisé.

### Variables d'Environnement Production

```env
VITE_API_URL=https://api.monmiammiam.com
VITE_APP_NAME="Mon Miam Miam"
```

### Déploiement Netlify/Vercel

```bash
# Netlify
npm run build
netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

### Déploiement avec Laravel

```bash
# Build dans public/assets Laravel
npm run build
# Fichiers copiés vers public/build
```

---

## 🛠️ Guide de Maintenance

### Ajout d'une Nouvelle Page

1. Créer le composant dans `pages/`
2. Ajouter la route dans `App.jsx`
3. Protéger si nécessaire avec `ProtectedRoute`

```jsx
<Route path="nouvelle-page" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <NouvellePage />
  </ProtectedRoute>
} />
```

### Ajout d'un Service API

```javascript
// Dans services/api.js
export const nouveauService = {
  async getItems() {
    const response = await api.get('/items')
    return { success: true, data: response.data }
  }
}
```

### Ajout d'un Composant Réutilisable

```jsx
// components/MonComposant.jsx
export default function MonComposant({ prop1, prop2 }) {
  return (
    <div className="...">
      {/* Contenu */}
    </div>
  )
}
```

### Tests Recommandés

```bash
# Tests unitaires (à implémenter)
npm run test

# Tests E2E (Playwright recommandé)
npx playwright test
```

---

## 📝 Conventions de Code

### Nommage

- **Composants** : PascalCase (`StudentDashboard.jsx`)
- **Fichiers** : camelCase (`authService.js`)
- **Variables** : camelCase (`userName`)
- **Constantes** : UPPER_SNAKE_CASE (`API_URL`)

### Structure Composant

```jsx
// 1. Imports
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// 2. Composant
export default function MonComposant() {
  // 3. Hooks
  const { user } = useAuth()
  const [state, setState] = useState(null)

  // 4. Fonctions
  const handleClick = () => {}

  // 5. Render
  return <div>...</div>
}
```

### Tailwind CSS

```jsx
// Préférer les classes utilitaires
<div className="flex items-center gap-4 px-6 py-4 bg-primary rounded-lg">

// Extraire dans components.css si réutilisé
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark;
  }
}
```

---

## 🐛 Débogage

### React DevTools

- Installer l'extension Chrome/Firefox
- Inspecter state, props, hooks

### Network Tab

- Vérifier les appels API
- Statuts HTTP, payloads
- Headers (Authorization)

### Console Logs

```javascript
console.log('User:', user)
console.error('Erreur API:', error.response)
```

---

## 📚 Ressources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2024  
**Auteurs** : Équipe Mon Miam Miam  
**Contact** : support@monmiammiam.com

