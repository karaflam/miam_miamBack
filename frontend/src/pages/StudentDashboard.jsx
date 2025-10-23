"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { mockMenuItems, mockOrders } from "../data/mockData"
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
} from "lucide-react"

export default function StudentDashboard() {
  const { user, updateBalance, updateLoyaltyPoints } = useAuth()
  const [activeTab, setActiveTab] = useState("menu")
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [orders, setOrders] = useState(mockOrders.filter((o) => o.userId === user?.id))
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("")

  const categories = ["Tous", "Plats", "Boissons", "Desserts"]

  const filteredItems =
    selectedCategory === "Tous" ? mockMenuItems : mockMenuItems.filter((item) => item.category === selectedCategory)

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
                {/* Category Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-secondary"
                          : "bg-white text-foreground hover:bg-muted"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        {item.isPromotion && (
                          <div className="absolute top-4 right-4 bg-error text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Promo!
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            {item.isPromotion ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-primary">{item.promotionPrice} F</span>
                                <span className="text-sm text-muted-foreground line-through">{item.price} F</span>
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-primary">{item.price} F</span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-primary text-secondary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <p className="text-muted-foreground">Parrainez vos amis et gagnez des points!</p>
                </div>

                <div className="bg-muted rounded-xl p-6 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Votre code de parrainage</p>
                  <div className="flex items-center gap-4">
                    <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-lg font-bold">
                      {user?.id.slice(0, 8).toUpperCase()}
                    </code>
                    <button className="bg-primary text-secondary px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                      Copier
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary text-secondary rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Partagez votre code</p>
                      <p className="text-sm text-muted-foreground">Envoyez votre code à vos amis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary text-secondary rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Ils s'inscrivent</p>
                      <p className="text-sm text-muted-foreground">Vos amis créent un compte avec votre code</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary text-secondary rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Gagnez des points</p>
                      <p className="text-sm text-muted-foreground">Recevez 5 points par parrainage réussi</p>
                    </div>
                  </div>
                </div>
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
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Mini-jeux</h2>
                <p className="text-muted-foreground mb-8">
                  Jouez à nos mini-jeux et gagnez des points de fidélité supplémentaires!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-muted rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="font-bold mb-2">Roue de la fortune</h3>
                    <p className="text-sm text-muted-foreground">Tentez votre chance quotidienne</p>
                  </div>
                  <div className="p-6 bg-muted rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="font-bold mb-2">Quiz culinaire</h3>
                    <p className="text-sm text-muted-foreground">Testez vos connaissances</p>
                  </div>
                </div>
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
