import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const location = useLocation()

  useEffect(() => {
    // Fondu sortant
    setIsVisible(false)
    
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      // Fondu entrant
      setIsVisible(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname, children])

  useEffect(() => {
    // Animation initiale au chargement
    setIsVisible(true)
  }, [])

  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {displayChildren}
    </div>
  )
}