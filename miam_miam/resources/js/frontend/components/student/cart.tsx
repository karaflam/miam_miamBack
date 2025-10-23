"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CartProps {
  items: any[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  balance: number
  onOrderComplete: (newBalance: number) => void
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onClearCart, balance, onOrderComplete }: CartProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  const handleSubmitOrder = async () => {
    if (total > balance) {
      toast({
        title: "Solde insuffisant",
        description: "Veuillez recharger votre compte",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        })
        return
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          userId: user.id,
          totalAmount: total,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        orderId: order.id,
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Update balance
      const newBalance = balance - total
      const { error: balanceError } = await supabase
        .from("balances")
        .update({ amount: newBalance })
        .eq("userId", user.id)

      if (balanceError) throw balanceError

      toast({
        title: "Commande réussie",
        description: "Votre commande a été enregistrée",
      })

      onOrderComplete(newBalance)
      router.refresh()
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la commande",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Panier
          </CardTitle>
          <CardDescription>Votre panier est vide</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Panier
          <Badge variant="secondary">{itemCount}</Badge>
        </CardTitle>
        <CardDescription>Vérifiez votre commande</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <img
                src={item.image || "/placeholder.svg?height=60&width=60"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">{(item.price / 100).toFixed(0)}F</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span>{(total / 100).toFixed(0)}F</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{(total / 100).toFixed(0)}F</span>
          </div>
          {total > balance && <p className="text-sm text-destructive">Solde insuffisant</p>}
        </div>

        <div className="space-y-2">
          <Button
            className="w-full bg-secondary text-white hover:bg-secondary-light"
            onClick={handleSubmitOrder}
            disabled={isSubmitting || total > balance}
          >
            {isSubmitting ? "Commande en cours..." : "Commander"}
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={onClearCart} disabled={isSubmitting}>
            Vider le panier
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
