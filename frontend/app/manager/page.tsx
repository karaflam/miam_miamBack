import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ManagerDashboard } from "@/components/manager/manager-dashboard"

export default async function ManagerPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "manager") {
    redirect("/")
  }

  // Get today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayOrders } = await supabase
    .from("orders")
    .select("totalAmount, status")
    .gte("createdAt", today.toISOString())

  const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0
  const todayOrdersCount = todayOrders?.length || 0
  const pendingCount = todayOrders?.filter((o) => o.status === "pending").length || 0

  // Get menu items
  const { data: menuItems } = await supabase.from("menu_items").select("*").order("category", { ascending: true })

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      `
      *,
      users!orders_userId_fkey (
        fullName
      )
    `,
    )
    .order("createdAt", { ascending: false })
    .limit(10)

  // Get top selling items
  const { data: topItems } = await supabase.rpc("get_top_selling_items", { limit_count: 5 })

  return (
    <ManagerDashboard
      user={profile}
      stats={{
        todayRevenue,
        todayOrdersCount,
        pendingCount,
      }}
      menuItems={menuItems || []}
      recentOrders={recentOrders || []}
      topItems={topItems || []}
    />
  )
}
