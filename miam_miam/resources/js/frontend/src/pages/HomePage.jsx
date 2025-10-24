import { Link } from "react-router-dom"
import { mockMenuItems, mockTopCustomers } from "../data/mockData"
import { Trophy, Tag, ArrowRight } from "lucide-react"
import CustomCarousel from "../components/CustomCarousel"
import FadeInOnScroll from "../components/FadeInOnScroll"

export default function HomePage() {
  const promotionItems = mockMenuItems.filter((item) => item.isPromotion)
  const dailyMenu = mockMenuItems.filter((item) => item.category === "Plats").slice(0, 4)

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

      {/* Promotions Section */}
      {promotionItems.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
              <div className="flex items-center gap-3 mb-8">
                <Tag className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Promotions du jour</h2>
              </div>
            </FadeInOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotionItems.map((item, index) => (
                <FadeInOnScroll key={item.id} delay={index * 150}>
                  <div className="bg-muted rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
                      <div className="absolute top-4 right-4 bg-error text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Promo !
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-primary">{item.promotionPrice} F</span>
                        <span className="text-lg text-muted-foreground line-through">{item.price} F</span>
                      </div>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Daily Menu Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <h2 className="text-3xl font-bold mb-8">Menu du jour</h2>
          </FadeInOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dailyMenu.map((item, index) => (
              <FadeInOnScroll key={item.id} delay={index * 100}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{item.description}</p>
                    <div className="text-2xl font-bold text-primary">{item.price} F</div>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
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
            to="/register"
            className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
