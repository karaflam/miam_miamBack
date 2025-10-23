"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface RecentOrdersProps {
  orders: any[]
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-warning text-warning-foreground" },
  preparing: { label: "En préparation", color: "bg-blue-500 text-white" },
  ready: { label: "Prêt", color: "bg-success text-white" },
  completed: { label: "Terminé", color: "bg-success text-white" },
  cancelled: { label: "Annulé", color: "bg-destructive text-destructive-foreground" },
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
        <CardDescription>Les dernières commandes passées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig]
            return (
              <div key={order.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{order.users?.fullName || "Client"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "PPP 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">{(order.totalAmount / 100).toFixed(0)}F</span>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
