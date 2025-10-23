import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { EmployeeDashboard } from "@/components/employee/employee-dashboard"

export default async function EmployeePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "employee") {
    redirect("/")
  }

  // Get all pending and preparing orders
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      users!orders_userId_fkey (
        fullName,
        email
      ),
      order_items (
        *,
        menu_items (*)
      )
    `,
    )
    .in("status", ["pending", "preparing", "ready"])
    .order("createdAt", { ascending: true })

  // Get today's completed orders count
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: completedToday } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .gte("createdAt", today.toISOString())

  return <EmployeeDashboard user={profile} orders={orders || []} completedToday={completedToday || 0} />
}
