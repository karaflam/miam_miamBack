"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setIsVisible(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-secondary text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience sur Mon Miam Miam. En continuant, vous acceptez
            notre utilisation des cookies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={declineCookies}
            className="bg-transparent border-white text-white hover:bg-white/10"
          >
            Refuser
          </Button>
          <Button size="sm" onClick={acceptCookies} className="bg-primary text-secondary hover:bg-primary-dark">
            Accepter
          </Button>
        </div>
      </div>
    </div>
  )
}
