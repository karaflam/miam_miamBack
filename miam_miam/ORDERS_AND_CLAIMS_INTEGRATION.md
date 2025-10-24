# 📦 Intégration Commandes & Réclamations - Frontend ↔ Backend

## ✅ Connexion établie

Les commandes et réclamations du frontend sont maintenant **reliées au backend Laravel** !

---

## 🔗 Services API créés

### Fichier : `resources/js/frontend/src/services/api.js`

Deux nouveaux services ont été ajoutés :

### 1. **orderService** - Gestion des commandes

```javascript
import { orderService } from '../services/api'

// Créer une commande
const result = await orderService.createOrder({
  type_livraison: 'livraison', // ou 'sur_place'
  heure_arrivee: '12:30',
  adresse_livraison: '123 Rue Example',
  commentaire_client: 'Sans oignons',
  articles: [
    { id: 1, prix: 2500, quantite: 2 },
    { id: 3, prix: 1500, quantite: 1 }
  ]
})

// Récupérer mes commandes
const orders = await orderService.getMyOrders()

// Récupérer une commande spécifique
const order = await orderService.getOrderDetails(orderId)
```

### 2. **claimService** - Gestion des réclamations

```javascript
import { claimService } from '../services/api'

// Créer une réclamation
const result = await claimService.createClaim({
  id_commande: 123, // Optionnel
  type_reclamation: 'Qualité du plat',
  description: 'Le plat était froid à la livraison',
  priorite: 'haute' // 'basse', 'moyenne', 'haute'
})

// Récupérer mes réclamations
const claims = await claimService.getMyClaims()

// Récupérer une réclamation spécifique
const claim = await claimService.getClaimDetails(claimId)

// Annuler une réclamation
const result = await claimService.cancelClaim(claimId)
```

---

## 🛣️ Routes API Laravel

### Fichier : `routes/api.php`

```php
// Commandes (protégées par auth:sanctum)
Route::post('/commandes', [CommandeController::class, 'store']);
Route::get('/commandes/mes-commandes', [CommandeController::class, 'index']);
Route::get('/commandes/{id}', [CommandeController::class, 'show']);

// Réclamations (protégées par auth:sanctum)
Route::post('/reclamations', [ReclamationController::class, 'store']);
Route::get('/reclamations/mes-reclamations', [ReclamationController::class, 'index']);
Route::get('/reclamations/{id}', [ReclamationController::class, 'show']);
Route::put('/reclamations/{id}/annuler', [ReclamationController::class, 'cancel']);
```

---

## 🎯 Contrôleurs Laravel

### 1. CommandeController

**Fichier** : `app/Http/Controllers/Api/CommandeController.php`

**Méthodes** :
- ✅ `store()` - Créer une commande
- ✅ `index()` - Liste des commandes de l'utilisateur
- ✅ `show($id)` - Détails d'une commande

**Validation** :
```php
// StoreCommandeRequest
'type_livraison' => 'required|in:livraison,sur_place',
'heure_arrivee' => 'required',
'adresse_livraison' => 'required_if:type_livraison,livraison',
'articles' => 'required|array|min:1',
'articles.*.id' => 'required|exists:articles,id_article',
'articles.*.prix' => 'required|numeric',
'articles.*.quantite' => 'required|integer|min:1',
```

### 2. ReclamationController (NOUVEAU)

**Fichier** : `app/Http/Controllers/Api/ReclamationController.php`

**Méthodes** :
- ✅ `store()` - Créer une réclamation
- ✅ `index()` - Liste des réclamations de l'utilisateur
- ✅ `show($id)` - Détails d'une réclamation
- ✅ `cancel($id)` - Annuler une réclamation

**Validation** :
```php
'id_commande' => 'nullable|exists:commandes,id_commande',
'type_reclamation' => 'required|string|max:100',
'description' => 'required|string',
'priorite' => 'required|in:basse,moyenne,haute',
```

---

## 📊 Modèles de données

### Commande

```php
{
  "id_commande": 123,
  "id_utilisateur": 456,
  "type_livraison": "livraison",
  "heure_arrivee": "12:30:00",
  "adresse_livraison": "123 Rue Example",
  "commentaire_client": "Sans oignons",
  "statut": "en_attente",
  "date_commande": "2025-10-24T16:30:00",
  "details": [
    {
      "id_article": 1,
      "quantite": 2,
      "prix_unitaire": 2500,
      "article": {
        "nom": "Thiéboudienne",
        "description": "Plat traditionnel"
      }
    }
  ]
}
```

### Réclamation

```php
{
  "id_reclamation": 789,
  "id_utilisateur": 456,
  "id_commande": 123,
  "type_reclamation": "Qualité du plat",
  "description": "Le plat était froid",
  "priorite": "haute",
  "statut": "en_attente",
  "date_reclamation": "2025-10-24T17:00:00",
  "date_resolution": null,
  "commande": { ... },
  "utilisateur": { ... }
}
```

---

## 🔐 Sécurité

### Authentification
- ✅ Toutes les routes sont protégées par `auth:sanctum`
- ✅ Token Bearer automatiquement ajouté par axios
- ✅ Vérification de l'utilisateur connecté

### Autorisation
- ✅ Un utilisateur ne peut voir que **ses propres** commandes
- ✅ Un utilisateur ne peut voir que **ses propres** réclamations
- ✅ Vérification `where('id_utilisateur', Auth::id())`

### Validation
- ✅ Validation côté serveur avec FormRequest
- ✅ Messages d'erreur en français
- ✅ Gestion des erreurs 422 (validation)

---

## 💡 Utilisation dans les composants React

### Exemple : Créer une commande depuis le panier

```jsx
import { orderService } from '../services/api'
import { useState } from 'react'

function Cart({ cart }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    // Préparer les données
    const orderData = {
      type_livraison: 'livraison',
      heure_arrivee: '12:30',
      adresse_livraison: '123 Rue Example',
      commentaire_client: 'Sans oignons',
      articles: cart.map(item => ({
        id: item.id,
        prix: item.price,
        quantite: item.quantity
      }))
    }

    // Envoyer au backend
    const result = await orderService.createOrder(orderData)

    if (result.success) {
      alert('Commande créée avec succès !')
      // Vider le panier, rediriger, etc.
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Envoi...' : 'Commander'}
      </button>
    </div>
  )
}
```

### Exemple : Afficher l'historique des commandes

```jsx
import { orderService } from '../services/api'
import { useEffect, useState } from 'react'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const result = await orderService.getMyOrders()
    if (result.success) {
      setOrders(result.data)
    }
    setLoading(false)
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div>
      <h2>Mes commandes</h2>
      {orders.map(order => (
        <div key={order.id_commande}>
          <h3>Commande #{order.id_commande}</h3>
          <p>Statut: {order.statut}</p>
          <p>Date: {order.date_commande}</p>
        </div>
      ))}
    </div>
  )
}
```

### Exemple : Créer une réclamation

```jsx
import { claimService } from '../services/api'
import { useState } from 'react'

function ClaimForm({ orderId }) {
  const [formData, setFormData] = useState({
    type_reclamation: '',
    description: '',
    priorite: 'moyenne'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await claimService.createClaim({
      id_commande: orderId,
      ...formData
    })

    if (result.success) {
      alert('Réclamation envoyée !')
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type de réclamation"
        value={formData.type_reclamation}
        onChange={(e) => setFormData({...formData, type_reclamation: e.target.value})}
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <select
        value={formData.priorite}
        onChange={(e) => setFormData({...formData, priorite: e.target.value})}
      >
        <option value="basse">Basse</option>
        <option value="moyenne">Moyenne</option>
        <option value="haute">Haute</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  )
}
```

---

## 🧪 Tests

### Test des commandes

```bash
# Créer une commande
curl -X POST http://localhost:8000/api/commandes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type_livraison": "livraison",
    "heure_arrivee": "12:30",
    "adresse_livraison": "123 Rue Example",
    "articles": [
      {"id": 1, "prix": 2500, "quantite": 2}
    ]
  }'

# Récupérer mes commandes
curl -X GET http://localhost:8000/api/commandes/mes-commandes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test des réclamations

```bash
# Créer une réclamation
curl -X POST http://localhost:8000/api/reclamations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_commande": 123,
    "type_reclamation": "Qualité",
    "description": "Plat froid",
    "priorite": "haute"
  }'

# Récupérer mes réclamations
curl -X GET http://localhost:8000/api/reclamations/mes-reclamations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Checklist d'intégration

### Backend ✅
- [x] Routes API créées (`/commandes`, `/reclamations`)
- [x] `CommandeController` avec méthodes `index()` et `show()`
- [x] `ReclamationController` créé avec toutes les méthodes
- [x] Validation des données
- [x] Sécurité (auth:sanctum)
- [x] Relations Eloquent (commande → détails, réclamation → commande)

### Frontend ✅
- [x] Service `orderService` créé
- [x] Service `claimService` créé
- [x] Gestion des erreurs
- [x] Token automatiquement ajouté
- [x] Documentation JSDoc

### À faire 🔄
- [ ] Intégrer `orderService` dans le composant panier
- [ ] Créer un composant `OrderHistory` connecté
- [ ] Créer un formulaire de réclamation
- [ ] Ajouter des notifications toast
- [ ] Gérer les états de chargement
- [ ] Ajouter la pagination pour l'historique

---

## 🎯 Prochaines étapes

### 1. Intégrer dans StudentDashboard

Remplacer les données mockées par les vraies données :

```jsx
// Avant
const [orders, setOrders] = useState(mockOrders)

// Après
const [orders, setOrders] = useState([])

useEffect(() => {
  if (activeTab === 'orders') {
    loadOrders()
  }
}, [activeTab])

const loadOrders = async () => {
  const result = await orderService.getMyOrders()
  if (result.success) {
    setOrders(result.data)
  }
}
```

### 2. Connecter le panier

```jsx
const handleCheckout = async () => {
  const orderData = {
    type_livraison: deliveryType,
    heure_arrivee: deliveryTime,
    adresse_livraison: address,
    commentaire_client: comment,
    articles: cart.map(item => ({
      id: item.id,
      prix: item.price,
      quantite: item.quantity
    }))
  }

  const result = await orderService.createOrder(orderData)
  
  if (result.success) {
    setCart([]) // Vider le panier
    setActiveTab('orders') // Aller vers l'historique
    // Afficher notification de succès
  }
}
```

### 3. Ajouter un bouton "Réclamer"

```jsx
<button onClick={() => openClaimModal(order.id_commande)}>
  Faire une réclamation
</button>
```

---

## 🎉 Résumé

✅ **Services API** créés et documentés  
✅ **Routes Laravel** configurées et sécurisées  
✅ **Contrôleurs** avec validation et gestion d'erreurs  
✅ **Prêt à l'emploi** dans vos composants React  

**Les commandes et réclamations sont maintenant connectées au backend !** 🚀

---

**Date de création :** 24 octobre 2025  
**Status :** ✅ Intégration complète  
**Prochaine étape :** Intégrer dans les composants React
