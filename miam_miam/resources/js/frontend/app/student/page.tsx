import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { StudentDashboard } from "@/components/student/student-dashboard"

export default async function StudentPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/")
  }

  // Get menu items
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("isAvailable", true)
    .order("category", { ascending: true })

  // Get user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        menu_items (*)
      )
    `,
    )
    .eq("userId", user.id)
    .order("createdAt", { ascending: false })
    .limit(10)

  // Get user's balance
  const { data: balance } = await supabase.from("balances").select("*").eq("userId", user.id).single()

  return (
    <StudentDashboard user={profile} menuItems={menuItems || []} orders={orders || []} balance={balance?.amount || 0} />
  )
}
