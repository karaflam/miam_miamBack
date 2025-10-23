"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, Package, CheckCircle, User } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface OrderCardProps {
  order: any
  onStatusChange: (orderId: string, newStatus: string) => void
  onComplete: (orderId: string) => void
}

const statusActions = {
  pending: { next: "preparing", label: "Commencer", icon: Package },
  preparing: { next: "ready", label: "Marquer prêt", icon: CheckCircle },
  ready: { next: "completed", label: "Terminer", icon: CheckCircle },
}

export function OrderCard({ order, onStatusChange, onComplete }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const action = statusActions[order.status as keyof typeof statusActions]
  const ActionIcon = action.icon

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    const supabase = createBrowserClient()

    try {
      const { error } = await supabase.from("orders").update({ status: action.next }).eq("id", order.id)

      if (error) throw error

      if (action.next === "completed") {
        onComplete(order.id)
        toast({
          title: "Commande terminée",
          description: "La commande a été marquée comme terminée",
        })
      } else {
        onStatusChange(order.id, action.next)
        toast({
          title: "Statut mis à jour",
          description: `La commande est maintenant ${action.next === "preparing" ? "en préparation" : "prête"}`,
        })
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Commande #{order.id.slice(0, 8)}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {format(new Date(order.createdAt), "HH:mm", { locale: fr })}
            </CardDescription>
          </div>
          <Badge className="bg-primary text-secondary">{(order.totalAmount / 100).toFixed(0)}F</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{order.users?.fullName || "Client"}</span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Articles:</p>
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between text-sm bg-surface p-2 rounded">
              <span>
                {item.quantity}x {item.menu_items?.name}
              </span>
              <span className="font-medium">{((item.price * item.quantity) / 100).toFixed(0)}F</span>
            </div>
          ))}
        </div>

        <Button
          className="w-full bg-secondary text-white hover:bg-secondary-light"
          onClick={handleStatusUpdate}
          disabled={isUpdating}
        >
          <ActionIcon className="h-4 w-4 mr-2" />
          {isUpdating ? "Mise à jour..." : action.label}
        </Button>
      </CardContent>
    </Card>
  )
}
