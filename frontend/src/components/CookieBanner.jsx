"use client"
import { Cookie } from "lucide-react"

export default function CookieBanner({ onAccept }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="w-6 h-6 text-primary flex-shrink-0" />
          <p className="text-sm">
            Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre utilisation
            des cookies.
          </p>
        </div>
        <button
          onClick={onAccept}
          className="bg-primary text-secondary px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
        >
          J'accepte
        </button>
      </div>
    </div>
  )
}
