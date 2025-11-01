"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { referralService, eventService } from "../services/api"
import Blackjack from "../../components/student/Game/blackjack/Blackjack"
import CulinaryQuiz from "../../components/student/Game/Quiz/CulinaryQuiz"
import Top10Clients from "../components/student/Top10Clients"
import {
  Wallet,
  Award,
  ShoppingCart,
  History,
  Gift,
  MessageSquare,
  Gamepad2,
  Users,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
  Store,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  User,
  Trophy,
  Calendar,
  PartyPopper,
  Tag,
  Eye,
} from "lucide-react"

export default function StudentDashboard() {
  const { user, updateBalance, updateLoyaltyPoints, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState("menu")
  const [cart, setCart] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchMenuTerm, setSearchMenuTerm] = useState('')
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [copied, setCopied] = useState(false)
  const [referralData, setReferralData] = useState({
    code: "",
    referrals: [],
  })
  const [loadingReferral, setLoadingReferral] = useState(false)
  const [referralError, setReferralError] = useState(null)
  const [activeGame, setActiveGame] = useState(null) // null, 'blackjack', 'quiz'
  
  // États pour les réclamations
  const [reclamations, setReclamations] = useState([])
  const [isLoadingReclamations, setIsLoadingReclamations] = useState(false)
  const [showReclamationModal, setShowReclamationModal] = useState(false)
  const [selectedCommandeForReclamation, setSelectedCommandeForReclamation] = useState(null)
  const [reclamationSubject, setReclamationSubject] = useState("")
  const [reclamationDescription, setReclamationDescription] = useState("")
  const [isSubmittingReclamation, setIsSubmittingReclamation] = useState(false)
  
  // États pour les événements
  const [events, setEvents] = useState([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState('all') // all, promotion, jeu, evenement
  
  // États pour le checkout
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [deliveryType, setDeliveryType] = useState("sur_place")

  // Charger les données du menu
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories', {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Erreur catégories:', error);
    }
  };

  const fetchMenuItems = async () => {
    setIsLoadingMenu(true);
    try {
      let url = 'http://localhost:8000/api/menu';
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('categorie', selectedCategory);
      }
      if (searchMenuTerm) {
        params.append('search', searchMenuTerm);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error('Erreur menu:', error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Fonction pour charger l'historique des commandes
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/commandes/mes-commandes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Rafraîchir les données utilisateur au chargement
  useEffect(() => {
    const refreshUserData = async () => {
      await refreshUser();
    };
    refreshUserData();
  }, []);

  // Fonction pour charger les événements
  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const result = await eventService.getAllEvents();
      if (result.success) {
        // Tous les événements viennent de la BDD (y compris jeux intégrés)
        // On filtre uniquement les événements actifs
        const activeEvents = (result.data || []).filter(event => event.active === 'oui');
        setEvents(activeEvents);
      }
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Fonction pour participer à un événement
  const handleParticipate = async (eventId) => {
    try {
      const result = await eventService.participate(eventId);
      if (result.success) {
        alert(result.message || 'Participation enregistrée avec succès!');
        fetchEvents(); // Recharger les événements
      } else {
        alert(result.error || 'Erreur lors de la participation');
      }
    } catch (error) {
      console.error('Erreur participation:', error);
      alert('Erreur lors de la participation');
    }
  };

  // Charger le menu au montage et quand les filtres changent
  useEffect(() => {
    if (activeTab === "menu") {
      fetchCategories();
      fetchMenuItems();
    }
    if (activeTab === "history") {
      fetchOrders();
    }
    if (activeTab === "reclamations") {
      fetchReclamations();
    }
    if (activeTab === "events") {
      fetchEvents();
    }
  }, [activeTab, selectedCategory, searchMenuTerm]);

  // Charger les données de parrainage quand on affiche l'onglet
  useEffect(() => {
    if (activeTab === "referral") {
      loadReferralData()
    }
  }, [activeTab])

  const loadReferralData = async () => {
    setLoadingReferral(true)
    setReferralError(null)
    
    try {
      // Charger le code de parrainage
      const codeResult = await referralService.getCode()
      if (codeResult.success) {
        setReferralData((prev) => ({
          ...prev,
          code: codeResult.data.code,
        }))
      } else {
        console.error("Erreur code:", codeResult.error)
      }
      
      // Charger la liste des filleuls
      const referralsResult = await referralService.getReferrals()
      if (referralsResult.success) {
        setReferralData((prev) => ({
          ...prev,
          referrals: referralsResult.data,
        }))
      } else {
        console.error("Erreur filleuls:", referralsResult.error)
      }
    } catch (error) {
      console.error("Erreur chargement parrainage:", error)
      setReferralError("Impossible de charger les données de parrainage")
    }
    
    setLoadingReferral(false)
  }

  const filteredItems = menuItems

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      setCart(
        cart.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)),
      )
    } else {
      const price = item.isPromotion ? item.promotionPrice : item.price
      setCart([...cart, { ...item, quantity: 1, price }])
    }
  }

  const updateQuantity = (itemId, change) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const handleCheckout = async (deliveryType) => {
    // Calculer la remise avec les points (1 point = 100 FCFA)
    const remise = pointsToUse * 100;
    const montantFinal = Math.max(0, cartTotal - remise);

    if (montantFinal > user.balance) {
      alert(`Solde insuffisant. Montant à payer: ${montantFinal} FCFA, Solde actuel: ${user.balance} FCFA`)
      return
    }

    if (pointsToUse > user.loyaltyPoints) {
      alert(`Points insuffisants. Vous avez ${user.loyaltyPoints} points.`)
      return
    }

    setIsCheckingOut(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Préparer les données de la commande
      const commandeData = {
        type_livraison: deliveryType === "delivery" ? "livraison" : "sur_place",
        articles: cart.map((item) => ({
          id: item.id,
          quantite: item.quantity,
          prix: item.price
        })),
        commentaire_client: "",
        points_utilises: pointsToUse
      };

      console.log('Envoi de la commande:', commandeData);

      const response = await fetch('http://localhost:8000/api/commandes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commandeData)
      });

      const data = await response.json();
      
      console.log('Réponse du serveur:', data);
      
      if (data.success) {
        const commande = data.data;
        
        // Rafraîchir les données utilisateur depuis le serveur
        await refreshUser();

        setCart([]);
        setPointsToUse(0);
        setActiveTab("history");
        
        // Message de succès détaillé
        const pointsGagnes = Math.floor(commande.montant_final / 1000);
        let message = `✅ Commande passée avec succès!\n\n`;
        message += `💰 Montant total: ${commande.montant_total} FCFA\n`;
        if (commande.montant_remise > 0) {
          message += `🎁 Remise (${pointsToUse} points): -${commande.montant_remise} FCFA\n`;
        }
        message += `💳 Montant payé: ${commande.montant_final} FCFA\n`;
        message += `⭐ Points gagnés: ${pointsGagnes}\n`;
        message += `📦 Type: ${deliveryType === "delivery" ? "Livraison" : "Sur place"}`;
        
        alert(message);
        
        // Recharger l'historique
        fetchOrders();
      } else {
        console.error('Erreur serveur:', data);
        alert(`❌ Erreur: ${data.message || data.error || 'Impossible de passer la commande'}`);
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert('❌ Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  const handleRecharge = async () => {
    const amount = Number.parseInt(rechargeAmount)
    if (!amount || amount <= 0) {
      alert('Veuillez entrer un montant valide')
      return
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8000/api/paiement/recharger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ montant: amount })
      });

      const data = await response.json();

      if (data.success) {
        // Rafraîchir les données utilisateur depuis le serveur
        await refreshUser();
        
        setShowRechargeModal(false)
        setRechargeAmount("")
        alert(`✅ Compte rechargé de ${amount} FCFA avec succès!\n\nNouveau solde: ${data.data.nouveau_solde} FCFA`)
      } else {
        alert(`❌ Erreur: ${data.error || 'Impossible de recharger le compte'}`)
      }
    } catch (error) {
      console.error('Erreur recharge:', error);
      alert('❌ Erreur lors de la recharge. Veuillez réessayer.')
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erreur lors de la copie:", err)
    }
  }

  const handleGameComplete = (points) => {
    if (points > 0) {
      updateLoyaltyPoints(points)
      alert(`Félicitations ! Vous avez gagné ${points} points de fidélité !`)
    }
    setActiveGame(null)
  }

  // Fonctions pour les réclamations
  const fetchReclamations = async () => {
    setIsLoadingReclamations(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/reclamations/mes-reclamations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setReclamations(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement réclamations:', error)
    } finally {
      setIsLoadingReclamations(false)
    }
  }

  const openReclamationModal = (commande) => {
    setSelectedCommandeForReclamation(commande)
    setReclamationSubject("")
    setReclamationDescription("")
    setShowReclamationModal(true)
  }

  const handleSubmitReclamation = async () => {
    if (!reclamationSubject.trim() || !reclamationDescription.trim()) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setIsSubmittingReclamation(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/reclamations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_commande: selectedCommandeForReclamation?.id_commande,
          sujet: reclamationSubject,
          description: reclamationDescription
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Réclamation créée avec succès !')
        setShowReclamationModal(false)
        setReclamationSubject("")
        setReclamationDescription("")
        setSelectedCommandeForReclamation(null)
        // Recharger les réclamations
        fetchReclamations()
      } else {
        alert(`❌ Erreur: ${data.message || 'Impossible de créer la réclamation'}`)
      }
    } catch (error) {
      console.error('Erreur création réclamation:', error)
      alert('❌ Erreur lors de la création de la réclamation')
    } finally {
      setIsSubmittingReclamation(false)
    }
  }

  const getStatutLabel = (statut) => {
    const labels = {
      'ouvert': 'Ouverte',
      'en_cours': 'En cours',
      'en_attente_validation': 'En attente de validation',
      'valide': 'Validée',
      'resolu': 'Résolue',
      'rejete': 'Rejetée'
    }
    return labels[statut] || statut
  }

  const getStatutColor = (statut) => {
    const colors = {
      'ouvert': 'bg-red-100 text-red-800',
      'en_cours': 'bg-yellow-100 text-yellow-800',
      'en_attente_validation': 'bg-orange-100 text-orange-800',
      'valide': 'bg-green-100 text-green-800',
      'resolu': 'bg-blue-100 text-blue-800',
      'rejete': 'bg-gray-100 text-gray-800'
    }
    return colors[statut] || 'bg-gray-100 text-gray-800'
  }

  // Fonction pour soumettre une réclamation
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    
    if (!complaintSubject.trim() || !complaintMessage.trim()) {
      setComplaintError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmittingComplaint(true);
    setComplaintError(null);
    setComplaintSuccess(false);

    try {
      const token = localStorage.getItem('auth_token');
      
      const reclamationData = {
        sujet: complaintSubject,
        description: complaintMessage
      };

      const response = await fetch('http://localhost:8000/api/reclamations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reclamationData)
      });

      const data = await response.json();
      
      if (data.success) {
        setComplaintSuccess(true);
        setComplaintSubject("");
        setComplaintMessage("");
        
        // Message de succès
        setTimeout(() => {
          alert("✅ Réclamation envoyée avec succès!\n\nNotre équipe va traiter votre demande dans les plus brefs délais.");
          setComplaintSuccess(false);
        }, 500);
      } else {
        setComplaintError(data.message || 'Impossible d\'envoyer la réclamation');
      }
    } catch (error) {
      console.error('Erreur réclamation:', error);
      setComplaintError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  }

  const canUseDiscount = user.loyaltyPoints >= 15

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solde</p>
                  <p className="text-2xl font-bold">{user?.balance || 0} F</p>
                </div>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-primary text-secondary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold"
              >
                Recharger
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points de fidélité</p>
                <p className="text-2xl font-bold">{user?.loyaltyPoints || 0} points</p>
                {canUseDiscount && <p className="text-xs text-success font-semibold">Réduction disponible!</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Panier</p>
                <p className="text-2xl font-bold">{cartItemsCount} article(s)</p>
                <p className="text-sm text-muted-foreground">{cartTotal} F</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-x-auto">
          <div className="flex gap-2 p-2 min-w-max">
            {[
              { id: "menu", label: "Menu", icon: ShoppingCart },
              { id: "history", label: "Historique", icon: History },
              { id: "top10", label: "Top 10", icon: Trophy },
              { id: "reclamations", label: "Réclamations", icon: MessageSquare },
              { id: "referral", label: "Parrainage", icon: Gift },
              { id: "events", label: "Événements", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id ? "bg-primary text-secondary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "menu" && (
              <div>
                {/* Search and Category Filter */}
                <div className="mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Rechercher un plat..."
                    value={searchMenuTerm}
                    onChange={(e) => setSearchMenuTerm(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === 'all'
                          ? "bg-primary text-secondary"
                          : "bg-white text-foreground hover:bg-muted"
                      }`}
                    >
                      Tous
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-secondary"
                            : "bg-white text-foreground hover:bg-muted"
                        }`}
                      >
                        {category.nom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Grid */}
                {isLoadingMenu ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement du menu...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun article disponible</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.nom}
                            className="w-full h-48 object-cover"
                          />
                          {!item.disponible && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Indisponible</span>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold">{item.nom}</h3>
                            {item.categorie && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {item.categorie.nom}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-primary">{item.prix} FCFA</span>
                              {item.temps_preparation && (
                                <span className="text-xs text-muted-foreground">⏱️ {item.temps_preparation} min</span>
                              )}
                            </div>
                            <button
                              onClick={() => addToCart({...item, price: item.prix, name: item.nom})}
                              disabled={!item.disponible}
                              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                                item.disponible
                                  ? 'bg-primary text-secondary hover:bg-primary-dark'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Historique des commandes</h2>
                {isLoadingOrders ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement de vos commandes...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-lg">Commande #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date_commande).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-semibold ${
                            order.statut === "livree"
                              ? "bg-success/20 text-success"
                              : order.statut === "en_preparation"
                                ? "bg-warning/20 text-warning"
                                : order.statut === "prete"
                                  ? "bg-primary/20 text-primary"
                                  : order.statut === "annulee"
                                    ? "bg-error/20 text-error"
                                    : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.statut === "livree"
                            ? "Livrée"
                            : order.statut === "en_preparation"
                              ? "En préparation"
                              : order.statut === "prete"
                                ? "Prête"
                                : order.statut === "annulee"
                                  ? "Annulée"
                                  : "En attente"}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.details && order.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {detail.quantite}x {detail.article?.nom || 'Article'}
                            </span>
                            <span className="font-semibold">{detail.prix_unitaire * detail.quantite} FCFA</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Détails des montants */}
                      <div className="bg-muted rounded-lg p-3 mb-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Montant total</span>
                          <span className="font-semibold">{order.montant_total} FCFA</span>
                        </div>
                        {order.montant_remise > 0 && (
                          <div className="flex justify-between text-success">
                            <span>Remise ({order.points_utilises} points)</span>
                            <span className="font-semibold">-{order.montant_remise} FCFA</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                          <span>Montant payé</span>
                          <span className="text-primary">{order.montant_final} FCFA</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {order.type_livraison === "livraison" ? (
                            <>
                              <Truck className="w-4 h-4" />
                              Livraison
                            </>
                          ) : (
                            <>
                              <Store className="w-4 h-4" />
                              Sur place
                            </>
                          )}
                        </div>
                        {order.points_utilises > 0 && (
                          <div className="flex items-center gap-1 text-sm text-purple-600">
                            <Award className="w-4 h-4" />
                            <span>{order.points_utilises} points utilisés</span>
                          </div>
                        )}
                      </div>

                      {/* Bouton Signaler un problème */}
                      <button
                        onClick={() => openReclamationModal(order)}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Signaler un problème
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "referral" && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Programme de parrainage</h2>
                  <p className="text-muted-foreground">Parrainez vos amis et gagnez 10 points par filleul!</p>
                </div>

                {loadingReferral ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : referralError ? (
                  <div className="bg-error/10 border border-error text-error rounded-xl p-6 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-semibold mb-2">{referralError}</p>
                    <button
                      onClick={loadReferralData}
                      className="mt-4 bg-primary text-secondary px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 mb-6 text-secondary">
                      <p className="text-sm text-secondary/80 mb-2">Votre code de parrainage</p>
                      <div className="flex items-center gap-4">
                        <code className="flex-1 bg-secondary/20 backdrop-blur-sm px-4 py-3 rounded-lg font-mono text-2xl font-bold tracking-wider">
                          {referralData.code}
                        </code>
                        <button
                          onClick={handleCopyCode}
                          className="bg-secondary text-primary px-6 py-3 rounded-lg hover:bg-secondary/90 transition-all font-semibold flex items-center gap-2 min-w-[120px] justify-center"
                        >
                          {copied ? (
                            <>
                              <Check className="w-5 h-5" />
                              Copié!
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5" />
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                {/* Statistiques de parrainage */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{referralData.referrals.length}</p>
                    <p className="text-sm text-muted-foreground">Filleuls</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-success mb-1">{referralData.referrals.length * 10}</p>
                    <p className="text-sm text-muted-foreground">Points gagnés</p>
                  </div>
                </div>

                {/* Liste des filleuls */}
                {referralData.referrals.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-4">Vos filleuls</h3>
                    <div className="space-y-2">
                      {referralData.referrals.map((referral, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{referral.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Inscrit le {new Date(referral.date).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-success">+10 points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {referralData.referrals.length === 0 && (
                  <div className="text-center py-8 bg-muted rounded-xl mb-6">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Aucun filleul pour le moment</p>
                    <p className="text-sm text-muted-foreground">Partagez votre code pour commencer!</p>
                  </div>
                )}

                {/* Comment ça marche */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Comment ça marche ?</h3>
                  <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary text-secondary rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Partagez votre code</p>
                      <p className="text-sm text-muted-foreground">
                        Copiez et envoyez votre code de parrainage à vos amis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary text-secondary rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Ils s'inscrivent</p>
                      <p className="text-sm text-muted-foreground">
                        Vos amis créent un compte en utilisant votre code
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary text-secondary rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Gagnez des points</p>
                      <p className="text-sm text-muted-foreground">
                        Recevez automatiquement 10 points de fidélité par filleul
                      </p>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Réclamations</h2>
                
                {complaintSuccess && (
                  <div className="mb-6 bg-success/10 border border-success text-success rounded-lg p-4 flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Réclamation envoyée avec succès!</p>
                      <p className="text-sm">Notre équipe va traiter votre demande dans les plus brefs délais.</p>
                    </div>
                  </div>
                )}
                
                {complaintError && (
                  <div className="mb-6 bg-error/10 border border-error text-error rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Erreur</p>
                      <p className="text-sm">{complaintError}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleComplaintSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sujet</label>
                    <input
                      type="text"
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      disabled={isSubmittingComplaint}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Objet de votre réclamation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={6}
                      value={complaintMessage}
                      onChange={(e) => setComplaintMessage(e.target.value)}
                      disabled={isSubmittingComplaint}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Décrivez votre problème en détail..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingComplaint}
                    className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingComplaint ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        Envoyer la réclamation
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "reclamations" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Mes réclamations</h2>
                {isLoadingReclamations ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement de vos réclamations...</p>
                  </div>
                ) : reclamations.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune réclamation pour le moment</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Vous pouvez signaler un problème depuis l'historique de vos commandes
                    </p>
                  </div>
                ) : (
                  reclamations.map((reclamation) => (
                    <div key={reclamation.id_reclamation} className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{reclamation.sujet}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(reclamation.statut)}`}>
                              {getStatutLabel(reclamation.statut)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {new Date(reclamation.date_ouverture).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {reclamation.commande && (
                            <p className="text-sm text-muted-foreground">
                              Commande #{reclamation.commande.id_commande}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700">{reclamation.description}</p>
                      </div>

                      {reclamation.commentaire_resolution && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                          <div className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-green-900 mb-1">Résolution</h4>
                              <p className="text-sm text-green-800">{reclamation.commentaire_resolution}</p>
                              {reclamation.date_cloture && (
                                <p className="text-xs text-green-600 mt-2">
                                  Clôturée le {new Date(reclamation.date_cloture).toLocaleDateString("fr-FR")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "top10" && (
              <Top10Clients />
            )}

            {activeTab === "events" && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Événements & Jeux</h2>
                  <p className="text-muted-foreground">
                    Découvrez nos promotions, jeux et événements spéciaux activés par l'équipe
                  </p>
                </div>

                {/* Filtres */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setSelectedEventType('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedEventType === 'all' 
                        ? 'bg-primary text-secondary' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setSelectedEventType('promotion')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedEventType === 'promotion' 
                        ? 'bg-primary text-secondary' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Gift className="w-4 h-4 inline mr-2" />
                    Promotions
                  </button>
                  <button
                    onClick={() => setSelectedEventType('jeu')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedEventType === 'jeu' 
                        ? 'bg-primary text-secondary' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4 inline mr-2" />
                    Jeux
                  </button>
                  <button
                    onClick={() => setSelectedEventType('evenement')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedEventType === 'evenement' 
                        ? 'bg-primary text-secondary' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <PartyPopper className="w-4 h-4 inline mr-2" />
                    Événements
                  </button>
                </div>

                {isLoadingEvents ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement des événements...</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const filteredEvents = selectedEventType === 'all'
                        ? events
                        : events.filter(event => event.type === selectedEventType);

                      if (filteredEvents.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
                            <p className="text-muted-foreground text-lg">
                              Aucun événement disponible pour le moment
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredEvents.map((event) => (
                            <div
                              key={event.id_evenement}
                              className="bg-gradient-to-br from-white to-muted rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                            >
                              <div className="relative h-48 overflow-hidden">
                                {event.url_affiche ? (
                                  <img
                                    src={event.url_affiche.startsWith('http') ? event.url_affiche : `http://localhost:8000${event.url_affiche}`}
                                    alt={event.titre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = '/placeholder.svg'}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    {event.type === 'promotion' && <Gift className="w-12 h-12 text-primary" />}
                                    {event.type === 'jeu' && <Gamepad2 className="w-12 h-12 text-primary" />}
                                    {event.type === 'evenement' && <PartyPopper className="w-12 h-12 text-primary" />}
                                  </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                                  {event.type === 'promotion' && 'Promotion'}
                                  {event.type === 'jeu' && 'Jeu'}
                                  {event.type === 'evenement' && 'Événement'}
                                </div>
                                {event.valeur_remise && event.type_remise === 'pourcentage' && (
                                  <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                    -{event.valeur_remise}%
                                  </div>
                                )}
                              </div>
                              <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{event.titre}</h3>
                                {event.description && (
                                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                <div className="space-y-2 mb-4 text-xs text-gray-600">
                                  {event.code_promo && (
                                    <div className="flex items-center gap-2">
                                      <Tag className="w-4 h-4 text-primary" />
                                      <span className="font-mono font-semibold">{event.code_promo}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>
                                      Du {new Date(event.date_debut).toLocaleDateString('fr-FR')} au{' '}
                                      {new Date(event.date_fin).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                  {event.limite_utilisation > 0 && (
                                    <div className="text-muted-foreground">
                                      {event.nombre_utilisation || 0} / {event.limite_utilisation} utilisations
                                    </div>
                                  )}
                                </div>
                                {event.type === 'jeu' || event.type === 'evenement' ? (
                                  <button
                                    onClick={() => handleParticipate(event.id_evenement)}
                                    className="w-full bg-primary text-secondary px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Participer
                                  </button>
                                ) : (
                                  <div className="text-center py-2 text-sm text-muted-foreground">
                                    Utilisez le code promo lors de la commande
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Mon Panier
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Votre panier est vide</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{item.name}</p>
                          <p className="text-primary font-bold">{item.price} F</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 bg-white rounded flex items-center justify-center hover:bg-primary hover:text-secondary transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 bg-white rounded flex items-center justify-center hover:bg-primary hover:text-secondary transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-error hover:bg-error/10 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Utilisation des points de fidélité */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">Points de fidélité</span>
                      </div>
                      <span className="text-sm text-purple-700">
                        {user.loyaltyPoints} points disponibles
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={Math.min(user.loyaltyPoints, Math.floor(cartTotal / 100))}
                          value={pointsToUse}
                          onChange={(e) => setPointsToUse(Math.max(0, Math.min(parseInt(e.target.value) || 0, user.loyaltyPoints, Math.floor(cartTotal / 100))))}
                          className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Points à utiliser"
                        />
                        <button
                          onClick={() => setPointsToUse(Math.min(user.loyaltyPoints, Math.floor(cartTotal / 100)))}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Max
                        </button>
                      </div>
                      <p className="text-xs text-purple-600">
                        1 point = 100 FCFA • Remise: {pointsToUse * 100} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-semibold">{cartTotal} FCFA</span>
                    </div>
                    {pointsToUse > 0 && (
                      <div className="flex justify-between mb-2 text-success">
                        <span>Remise ({pointsToUse} points)</span>
                        <span className="font-semibold">-{pointsToUse * 100} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total à payer</span>
                      <span className="text-primary">{Math.max(0, cartTotal - (pointsToUse * 100))} FCFA</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⭐ Vous gagnerez {Math.floor(Math.max(0, cartTotal - (pointsToUse * 100)) / 1000)} points avec cette commande
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleCheckout("pickup")}
                      disabled={isCheckingOut}
                      className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <Store className="w-5 h-5" />
                          Commander sur place
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCheckout("delivery")}
                      disabled={isCheckingOut}
                      className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <Truck className="w-5 h-5" />
                          Commander en livraison
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Recharger mon compte</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Montant (F)</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5000"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setRechargeAmount(amount.toString())}
                  className="py-2 bg-muted rounded-lg hover:bg-primary hover:text-secondary transition-colors font-semibold"
                >
                  {amount} F
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRecharge}
                className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Recharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réclamation */}
      {showReclamationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Signaler un problème</h3>
            
            {selectedCommandeForReclamation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-blue-900">
                  Commande #{selectedCommandeForReclamation.id_commande}
                </p>
                <p className="text-xs text-blue-700">
                  {new Date(selectedCommandeForReclamation.date_commande).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Sujet de la réclamation *</label>
                <input
                  type="text"
                  value={reclamationSubject}
                  onChange={(e) => setReclamationSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Commande incomplète"
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reclamationSubject.length}/150 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description détaillée *</label>
                <textarea
                  value={reclamationDescription}
                  onChange={(e) => setReclamationDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                  placeholder="Décrivez le problème rencontré en détail..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReclamationModal(false)
                  setReclamationSubject("")
                  setReclamationDescription("")
                  setSelectedCommandeForReclamation(null)
                }}
                className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                disabled={isSubmittingReclamation}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitReclamation}
                disabled={isSubmittingReclamation || !reclamationSubject.trim() || !reclamationDescription.trim()}
                className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingReclamation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Envoyer la réclamation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
