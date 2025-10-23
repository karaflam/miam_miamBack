"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingBag, DollarSign, Gift } from "lucide-react"
import { UserManagement } from "./user-management"
import { PromotionManagement } from "./promotion-management"

interface AdminDashboardProps {
  user: any
  users: any[]
  stats: {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
  }
  promotions: any[]
}

export function AdminDashboard({ user, users, stats, promotions }: AdminDashboardProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panneau d'administration</h1>
        <p className="text-muted-foreground">Bienvenue, {user.fullName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalRevenue / 100).toFixed(0)}F</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Promotions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <PromotionManagement promotions={promotions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
