import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  // Get all users
  const { data: users } = await supabase.from("users").select("*").order("createdAt", { ascending: false })

  // Get system stats
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { data: revenueData } = await supabase.from("orders").select("totalAmount").eq("status", "completed")

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.totalAmount, 0) || 0

  // Get promotions
  const { data: promotions } = await supabase.from("promotions").select("*").order("createdAt", { ascending: false })

  return (
    <AdminDashboard
      user={profile}
      users={users || []}
      stats={{
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
      }}
      promotions={promotions || []}
    />
  )
}
