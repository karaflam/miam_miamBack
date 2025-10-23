"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, CheckCircle, XCircle, Package } from "lucide-react"

interface OrderHistoryProps {
  orders: any[]
}

const statusConfig = {
  pending: { label: "En attente", icon: Clock, color: "bg-warning text-warning-foreground" },
  preparing: { label: "En préparation", icon: Package, color: "bg-blue-500 text-white" },
  ready: { label: "Prêt", icon: CheckCircle, color: "bg-success text-white" },
  completed: { label: "Terminé", icon: CheckCircle, color: "bg-success text-white" },
  cancelled: { label: "Annulé", icon: XCircle, color: "bg-destructive text-destructive-foreground" },
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des commandes</CardTitle>
          <CardDescription>Aucune commande pour le moment</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = statusConfig[order.status as keyof typeof statusConfig]
        const StatusIcon = status.icon

        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Commande #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    {format(new Date(order.createdAt), "PPP 'à' HH:mm", { locale: fr })}
                  </CardDescription>
                </div>
                <Badge className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menu_items?.name}
                    </span>
                    <span className="font-medium">{((item.price * item.quantity) / 100).toFixed(0)}F</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{(order.totalAmount / 100).toFixed(0)}F</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
