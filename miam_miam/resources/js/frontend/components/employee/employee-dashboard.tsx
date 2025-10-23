"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { OrderCard } from "./order-card"
import { Clock, Package, CheckCircle, TrendingUp } from "lucide-react"

interface EmployeeDashboardProps {
  user: any
  orders: any[]
  completedToday: number
}

export function EmployeeDashboard({ user, orders, completedToday }: EmployeeDashboardProps) {
  const [activeOrders, setActiveOrders] = useState(orders)

  const pendingOrders = activeOrders.filter((order) => order.status === "pending")
  const preparingOrders = activeOrders.filter((order) => order.status === "preparing")
  const readyOrders = activeOrders.filter((order) => order.status === "ready")

  const handleOrderUpdate = (orderId: string, newStatus: string) => {
    setActiveOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const handleOrderComplete = (orderId: string) => {
    setActiveOrders((prev) => prev.filter((order) => order.id !== orderId))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Espace Employé</h1>
        <p className="text-muted-foreground">Bienvenue, {user.fullName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En préparation</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preparingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêtes</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées aujourd'hui</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            En attente
            {pendingOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            En préparation
            {preparingOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {preparingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Prêtes
            {readyOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {readyOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Aucune commande en attente</CardTitle>
                <CardDescription>Toutes les commandes ont été traitées</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleOrderUpdate}
                  onComplete={handleOrderComplete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preparing" className="mt-6">
          {preparingOrders.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Aucune commande en préparation</CardTitle>
                <CardDescription>Commencez à préparer les commandes en attente</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleOrderUpdate}
                  onComplete={handleOrderComplete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          {readyOrders.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Aucune commande prête</CardTitle>
                <CardDescription>Les commandes prêtes apparaîtront ici</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleOrderUpdate}
                  onComplete={handleOrderComplete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
