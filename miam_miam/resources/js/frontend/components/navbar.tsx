"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "student":
        return "/student"
      case "employee":
        return "/employee"
      case "manager":
        return "/manager"
      case "admin":
        return "/admin"
      default:
        return "/"
    }
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            <span className="text-primary">Mon</span>
            <span className="text-secondary"> Miam Miam</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href={getDashboardLink()}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-secondary hover:bg-primary-dark">
                  Inscription
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
