"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Clock, TrendingUp } from "lucide-react"
import { MenuManagement } from "./menu-management"
import { RecentOrders } from "./recent-orders"
import { TopSellingItems } from "./top-selling-items"

interface ManagerDashboardProps {
  user: any
  stats: {
    todayRevenue: number
    todayOrdersCount: number
    pendingCount: number
  }
  menuItems: any[]
  recentOrders: any[]
  topItems: any[]
}

export function ManagerDashboard({ user, stats, menuItems, recentOrders, topItems }: ManagerDashboardProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord Manager</h1>
        <p className="text-muted-foreground">Bienvenue, {user.fullName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu du jour</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.todayRevenue / 100).toFixed(0)}F</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes du jour</CardTitle>
            <ShoppingBag className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrdersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayOrdersCount > 0 ? (stats.todayRevenue / stats.todayOrdersCount / 100).toFixed(0) : 0}F
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="menu">Gestion du menu</TabsTrigger>
          <TabsTrigger value="orders">Commandes récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSellingItems items={topItems} />
            <RecentOrders orders={recentOrders.slice(0, 5)} />
          </div>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <MenuManagement menuItems={menuItems} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <RecentOrders orders={recentOrders} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
