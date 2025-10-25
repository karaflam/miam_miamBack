import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { mockTopCustomers } from "../data/mockData"
import { Trophy, Tag, ArrowRight, Loader2 } from "lucide-react"
import CustomCarousel from "../components/CustomCarousel"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function HomePage() {
  const [menuItems, setMenuItems] = useState([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setIsLoadingMenu(true);
    try {
      const response = await fetch('http://localhost:8000/api/menu', {
        headers: { 'Accept': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error('Erreur menu:', error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Filtrer uniquement les articles disponibles
  const availableItems = menuItems.filter(item => item.disponible);
  const dailyMenu = availableItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary to-primary/20 text-white py-20 min-h-screen">
        <div className="absolute inset-0">
          <CustomCarousel />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center lg:text-left max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance drop-shadow-lg">Bienvenue chez Mon Miam Miam</h1>
            <p className="text-xl md:text-2xl mb-8 text-balance text-white/90 drop-shadow-lg">
              Votre restaurant universitaire préféré. Commandez en ligne et gagnez des points de fidélité !
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-primary text-secondary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


      {/* Daily Menu Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <h2 className="text-3xl font-bold mb-8">Menu du jour</h2>
          </FadeInOnScroll>
          
          {isLoadingMenu ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement du menu...</p>
            </div>
          ) : dailyMenu.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Aucun plat disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyMenu.map((item, index) => (
                <FadeInOnScroll key={item.id} delay={index * 100}>
                  <div className="bg-muted rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.nom} 
                        className="w-full h-48 object-cover"
                        onError={(e) => e.target.src = '/placeholder.svg'}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">🍽️</span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{item.nom}</h3>
                      <p className="text-muted-foreground mb-4 text-sm line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">{item.prix} FCFA</div>
                        {item.temps_preparation && (
                          <span className="text-xs text-muted-foreground">⏱️ {item.temps_preparation} min</span>
                        )}
                      </div>
                      {item.categorie && (
                        <div className="mt-2">
                          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                            {item.categorie.nom}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Customers Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Top Clients du Mois</h2>
            </div>
          </FadeInOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {mockTopCustomers.map((customer, index) => (
              <FadeInOnScroll key={customer.id} delay={index * 120}>
                <div className="bg-muted rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="relative inline-block mb-4">
                    <img
                      src={customer.avatar || "/placeholder.svg"}
                      alt={customer.name}
                      className="w-20 h-20 rounded-full mx-auto transition-transform duration-300 hover:scale-110"
                    />
                    {index < 3 && (
                      <div
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold animate-pulse ${
                          index === 0 ? "bg-warning" : index === 1 ? "bg-muted-foreground" : "bg-primary"
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold mb-2">{customer.name}</h3>
                  <div className="text-primary font-bold text-lg">{customer.points} points</div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary-dark text-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à commander ?</h2>
          <p className="text-xl mb-8 text-balance">
            Inscrivez-vous maintenant et profitez de notre programme de fidélité. 1000F dépensés = 1 point !
          </p>
          <Link
            to="/student-register"
            className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer avec lien discret pour connexion étudiants */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 Mon Miam Miam. Tous droits réservés.</p>
            <div className="flex gap-6 text-sm">
              <Link to="/student-login" className="hover:text-white transition-colors">
                Espace Étudiant
              </Link>
              <Link to="/staff-login" className="hover:text-white transition-colors">
                Espace Staff
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
