"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MenuItemCard } from "./menu-item-card"
import { OrderHistory } from "./order-history"
import { Cart } from "./cart"
import { BalanceCard } from "./balance-card"
import { ShoppingCart, History } from "lucide-react"

interface StudentDashboardProps {
  user: any
  menuItems: any[]
  orders: any[]
  balance: number
}

export function StudentDashboard({ user, menuItems, orders, balance }: StudentDashboardProps) {
  const [cart, setCart] = useState<any[]>([])
  const [currentBalance, setCurrentBalance] = useState(balance)

  const addToCart = (item: any) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      setCart(
        cart.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)),
      )
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  // Group menu items by category
  const groupedItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bienvenue, {user.fullName}</h1>
        <p className="text-muted-foreground">Commandez vos plats préférés</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Menu
                {cartCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {cartCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="mt-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <OrderHistory orders={orders} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <BalanceCard balance={currentBalance} onBalanceUpdate={setCurrentBalance} />
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            balance={currentBalance}
            onOrderComplete={(newBalance) => {
              setCurrentBalance(newBalance)
              clearCart()
            }}
          />
        </div>
      </div>
    </div>
  )
}
