/**
 * EXEMPLE D'INTÉGRATION - Commandes et Réclamations
 * 
 * Ce fichier montre comment intégrer les services orderService et claimService
 * dans vos composants React.
 * 
 * Copiez ces exemples dans StudentDashboard.jsx
 */

import { useState, useEffect } from 'react'
import { orderService, claimService } from '../services/api'
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

// ============================================
// EXEMPLE 1: Passer une commande depuis le panier
// ============================================

export function CheckoutExample({ cart, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deliveryType, setDeliveryType] = useState('sur_place')
  const [deliveryTime, setDeliveryTime] = useState('12:30')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')

  const handleCheckout = async () => {
    // Validation
    if (cart.length === 0) {
      setError('Votre panier est vide')
      return
    }

    if (deliveryType === 'livraison' && !address) {
      setError('Veuillez entrer une adresse de livraison')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Préparer les données de la commande
      const orderData = {
        type_livraison: deliveryType,
        heure_arrivee: deliveryTime,
        adresse_livraison: deliveryType === 'livraison' ? address : null,
        commentaire_client: comment || null,
        articles: cart.map(item => ({
          id: item.id,
          prix: item.price,
          quantite: item.quantity
        }))
      }

      // Envoyer au backend
      const result = await orderService.createOrder(orderData)

      if (result.success) {
        // Succès !
        alert('Commande créée avec succès !')
        onSuccess?.() // Callback pour vider le panier, etc.
      } else {
        // Erreur
        setError(result.error)
        
        // Afficher les erreurs de validation
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join('\n')
          setError(errorMessages)
        }
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la commande')
      console.error('Erreur commande:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Finaliser la commande</h3>

      {/* Type de livraison */}
      <div>
        <label className="block mb-2">Type de livraison</label>
        <select
          value={deliveryType}
          onChange={(e) => setDeliveryType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="sur_place">Sur place</option>
          <option value="livraison">Livraison</option>
        </select>
      </div>

      {/* Heure souhaitée */}
      <div>
        <label className="block mb-2">Heure souhaitée</label>
        <input
          type="time"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Adresse (si livraison) */}
      {deliveryType === 'livraison' && (
        <div>
          <label className="block mb-2">Adresse de livraison</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Rue Example, Yaoundé"
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {/* Commentaire */}
      <div>
        <label className="block mb-2">Commentaire (optionnel)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ex: Sans oignons, bien cuit..."
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Bouton */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Commander'
        )}
      </button>
    </div>
  )
}

// ============================================
// EXEMPLE 2: Afficher l'historique des commandes
// ============================================

export function OrderHistoryExample() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await orderService.getMyOrders()

      if (result.success) {
        setOrders(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement des commandes')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucune commande pour le moment
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Mes commandes</h3>

      {orders.map((order) => (
        <div key={order.id_commande} className="border rounded-lg p-4 bg-white shadow">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold">Commande #{order.id_commande}</h4>
              <p className="text-sm text-gray-500">
                {new Date(order.date_commande).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <StatusBadge status={order.statut} />
          </div>

          {/* Articles */}
          <div className="space-y-2 mb-3">
            {order.details?.map((detail) => (
              <div key={detail.id_detail} className="flex justify-between text-sm">
                <span>
                  {detail.quantite}x {detail.article?.nom || 'Article'}
                </span>
                <span className="font-medium">
                  {((detail.prix_unitaire * detail.quantite) / 100).toFixed(0)}F
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">
              {(order.montant_total / 100).toFixed(0)}F
            </span>
          </div>

          {/* Type de livraison */}
          <div className="mt-2 text-sm text-gray-600">
            {order.type_livraison === 'livraison' ? '🚚 Livraison' : '🏪 Sur place'}
            {order.heure_arrivee && ` - ${order.heure_arrivee}`}
          </div>
        </div>
      ))}
    </div>
  )
}

// Badge de statut
function StatusBadge({ status }) {
  const configs = {
    en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    en_preparation: { label: 'En préparation', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
    prete: { label: 'Prête', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    livree: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    annulee: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
  }

  const config = configs[status] || configs.en_attente
  const Icon = config.icon

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

// ============================================
// EXEMPLE 3: Créer une réclamation
// ============================================

export function ClaimFormExample({ orderId, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    type_reclamation: '',
    description: '',
    priorite: 'moyenne'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.type_reclamation || !formData.description) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await claimService.createClaim({
        id_commande: orderId,
        ...formData
      })

      if (result.success) {
        alert('Réclamation envoyée avec succès !')
        onSuccess?.()
        // Réinitialiser le formulaire
        setFormData({
          type_reclamation: '',
          description: '',
          priorite: 'moyenne'
        })
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi de la réclamation')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">Faire une réclamation</h3>

      {/* Type de réclamation */}
      <div>
        <label className="block mb-2 font-medium">Type de réclamation</label>
        <select
          value={formData.type_reclamation}
          onChange={(e) => setFormData({...formData, type_reclamation: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Sélectionnez un type</option>
          <option value="Qualité du plat">Qualité du plat</option>
          <option value="Retard de livraison">Retard de livraison</option>
          <option value="Commande incomplète">Commande incomplète</option>
          <option value="Erreur de commande">Erreur de commande</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 font-medium">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Décrivez votre problème en détail..."
          className="w-full p-2 border rounded"
          rows={5}
          required
        />
      </div>

      {/* Priorité */}
      <div>
        <label className="block mb-2 font-medium">Priorité</label>
        <select
          value={formData.priorite}
          onChange={(e) => setFormData({...formData, priorite: e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="basse">Basse</option>
          <option value="moyenne">Moyenne</option>
          <option value="haute">Haute</option>
        </select>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bouton */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Envoyer la réclamation'
        )}
      </button>
    </form>
  )
}

// ============================================
// EXEMPLE 4: Afficher les réclamations
// ============================================

export function ClaimsListExample() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await claimService.getMyClaims()

      if (result.success) {
        setClaims(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement des réclamations')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (claimId) => {
    if (!confirm('Voulez-vous vraiment annuler cette réclamation ?')) {
      return
    }

    const result = await claimService.cancelClaim(claimId)

    if (result.success) {
      alert('Réclamation annulée')
      loadClaims() // Recharger la liste
    } else {
      alert(result.error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucune réclamation
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Mes réclamations</h3>

      {claims.map((claim) => (
        <div key={claim.id_reclamation} className="border rounded-lg p-4 bg-white shadow">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold">{claim.type_reclamation}</h4>
              <p className="text-sm text-gray-500">
                {new Date(claim.date_reclamation).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <ClaimStatusBadge status={claim.statut} priorite={claim.priorite} />
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-3">{claim.description}</p>

          {/* Commande liée */}
          {claim.id_commande && (
            <p className="text-xs text-gray-500">
              Commande #{claim.id_commande}
            </p>
          )}

          {/* Actions */}
          {claim.statut === 'en_attente' && (
            <button
              onClick={() => handleCancel(claim.id_reclamation)}
              className="mt-3 text-sm text-red-600 hover:text-red-800"
            >
              Annuler la réclamation
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// Badge de statut réclamation
function ClaimStatusBadge({ status, priorite }) {
  const statusConfigs = {
    en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
    resolue: { label: 'Résolue', color: 'bg-green-100 text-green-800' },
    annulee: { label: 'Annulée', color: 'bg-gray-100 text-gray-800' },
  }

  const prioriteConfigs = {
    basse: { label: '🟢', title: 'Priorité basse' },
    moyenne: { label: '🟡', title: 'Priorité moyenne' },
    haute: { label: '🔴', title: 'Priorité haute' },
  }

  const statusConfig = statusConfigs[status] || statusConfigs.en_attente
  const prioriteConfig = prioriteConfigs[priorite] || prioriteConfigs.moyenne

  return (
    <div className="flex items-center gap-2">
      <span title={prioriteConfig.title}>{prioriteConfig.label}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    </div>
  )
}
