"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import CookieBanner from "./CookieBanner"

export default function Layout() {
  const [showCookieBanner, setShowCookieBanner] = useState(!localStorage.getItem("cookiesAccepted"))

  const handleAcceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true")
    setShowCookieBanner(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {showCookieBanner && <CookieBanner onAccept={handleAcceptCookies} />}
    </div>
  )
}
