"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { referralService } from "../services/api"
import { mockOrders } from "../data/mockData"
import Blackjack from "../../components/student/Game/blackjack/Blackjack"
import CulinaryQuiz from "../../components/student/Game/Quiz/CulinaryQuiz"
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
} from "lucide-react"

export default function StudentDashboard() {
  const { user, updateBalance, updateLoyaltyPoints } = useAuth()
  const [activeTab, setActiveTab] = useState("menu")
  const [cart, setCart] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchMenuTerm, setSearchMenuTerm] = useState('')
  const [orders, setOrders] = useState(mockOrders.filter((o) => o.userId === user?.id))
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

  // Charger le menu au montage et quand les filtres changent
  useEffect(() => {
    if (activeTab === "menu") {
      fetchCategories();
      fetchMenuItems();
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

  const handleCheckout = (deliveryType) => {
    if (cartTotal > user.balance) {
      alert("Solde insuffisant. Veuillez recharger votre compte.")
      return
    }

    const newOrder = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      items: cart.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cartTotal,
      status: "pending",
      deliveryType,
      createdAt: new Date().toISOString(),
    }

    setOrders([newOrder, ...orders])
    updateBalance(-cartTotal)

    // Calculate loyalty points: 1000F = 1 point
    const pointsEarned = Math.floor(cartTotal / 1000)
    if (pointsEarned > 0) {
      updateLoyaltyPoints(pointsEarned)
    }

    setCart([])
    setActiveTab("history")
    alert(`Commande passée avec succès! Vous avez gagné ${pointsEarned} point(s) de fidélité.`)
  }

  const handleRecharge = () => {
    const amount = Number.parseInt(rechargeAmount)
    if (amount > 0) {
      updateBalance(amount)
      setShowRechargeModal(false)
      setRechargeAmount("")
      alert(`Compte rechargé de ${amount} F avec succès!`)
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
              { id: "referral", label: "Parrainage", icon: Gift },
              { id: "complaints", label: "Réclamations", icon: MessageSquare },
              { id: "games", label: "Mini-jeux", icon: Gamepad2 },
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
                {orders.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-lg">Commande #{order.id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
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
                            order.status === "completed"
                              ? "bg-success/20 text-success"
                              : order.status === "preparing"
                                ? "bg-warning/20 text-warning"
                                : order.status === "ready"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Terminée"
                            : order.status === "preparing"
                              ? "En préparation"
                              : order.status === "ready"
                                ? "Prête"
                                : "En attente"}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-semibold">{item.price * item.quantity} F</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {order.deliveryType === "delivery" ? (
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
                        <p className="text-xl font-bold text-primary">{order.total} F</p>
                      </div>
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
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sujet</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Objet de votre réclamation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Décrivez votre problème en détail..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Envoyer la réclamation
                  </button>
                </form>
              </div>
            )}

            {activeTab === "games" && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                {!activeGame ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gamepad2 className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Mini-jeux</h2>
                    <p className="text-muted-foreground mb-8">
                      Jouez à nos mini-jeux et gagnez des points de fidélité supplémentaires!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      <div 
                        onClick={() => setActiveGame('blackjack')}
                        className="p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-red-400 transform hover:scale-105"
                      >
                        <div className="text-5xl mb-4">🃏</div>
                        <h3 className="font-bold text-xl mb-2 text-red-700">Blackjack</h3>
                        <p className="text-sm text-red-600 mb-3">Battez le croupier et gagnez gros!</p>
                        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-700">
                          <Award className="w-4 h-4" />
                          <span>Jusqu'à 50 points</span>
                        </div>
                      </div>
                      <div 
                        onClick={() => setActiveGame('quiz')}
                        className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-400 transform hover:scale-105"
                      >
                        <div className="text-5xl mb-4">🍽️</div>
                        <h3 className="font-bold text-xl mb-2 text-purple-700">Quiz Culinaire</h3>
                        <p className="text-sm text-purple-600 mb-3">Testez vos connaissances sur la cuisine sénégalaise</p>
                        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-purple-700">
                          <Award className="w-4 h-4" />
                          <span>Jusqu'à 23 points</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Astuce :</strong> Accumulez des points pour débloquer des réductions exclusives !
                      </p>
                    </div>
                  </div>
                ) : activeGame === 'blackjack' ? (
                  <div>
                    <button
                      onClick={() => setActiveGame(null)}
                      className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      ← Retour aux jeux
                    </button>
                    <Blackjack />
                  </div>
                ) : activeGame === 'quiz' ? (
                  <div>
                    <button
                      onClick={() => setActiveGame(null)}
                      className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      ← Retour aux jeux
                    </button>
                    <CulinaryQuiz onComplete={handleGameComplete} />
                  </div>
                ) : null}
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

                  {canUseDiscount && (
                    <div className="bg-success/10 border border-success text-success rounded-lg p-3 mb-4 text-sm">
                      <p className="font-semibold">Réduction disponible!</p>
                      <p className="text-xs">Utilisez 15 points pour 1000F de réduction</p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-semibold">{cartTotal} F</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">{cartTotal} F</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleCheckout("pickup")}
                      className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                      <Store className="w-5 h-5" />
                      Commander sur place
                    </button>
                    <button
                      onClick={() => handleCheckout("delivery")}
                      className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Truck className="w-5 h-5" />
                      Commander en livraison
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
    </div>
  )
}
