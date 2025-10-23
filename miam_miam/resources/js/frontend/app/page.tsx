import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockMenuItems, mockPromotions, mockTopCustomers } from "@/lib/mock-data"
import { Star, TrendingUp, Gift, ArrowRight } from "lucide-react"

export default function HomePage() {
  const specialItems = mockMenuItems.filter((item) => item.isSpecial)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-secondary text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Bienvenue chez <span className="text-primary">Mon Miam Miam</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted max-w-2xl mx-auto text-pretty">
            Découvrez nos plats du jour et commandez en quelques clics
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-primary text-secondary hover:bg-primary-dark text-lg px-8">
              Commander maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Menu du Jour */}
      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Menu du Jour</h2>
              <p className="text-muted-foreground">Nos spécialités d'aujourd'hui</p>
            </div>
            <Star className="h-8 w-8 text-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  <Badge className="absolute top-3 right-3 bg-primary text-secondary">Spécial</Badge>
                </div>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{(item.price / 100).toFixed(0)}F</span>
                    <Link href="/register">
                      <Button size="sm" className="bg-secondary text-white hover:bg-secondary-light">
                        Commander
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Gift className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Promotions & Événements</h2>
              <p className="text-muted-foreground">Ne manquez pas nos offres spéciales</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPromotions.map((promo) => (
              <Card key={promo.id} className="overflow-hidden">
                <div className="aspect-[3/1] relative">
                  <img
                    src={promo.image || "/placeholder.svg"}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{promo.title}</CardTitle>
                  <CardDescription className="text-base">{promo.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Customers */}
      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Top 10 Clients</h2>
              <p className="text-muted-foreground">Les meilleurs clients du mois</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Rang</th>
                      <th className="px-6 py-4 text-left">Nom</th>
                      <th className="px-6 py-4 text-right">Commandes</th>
                      <th className="px-6 py-4 text-right">Total dépensé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTopCustomers.map((customer, index) => (
                      <tr key={customer.userId} className={index % 2 === 0 ? "bg-background" : "bg-surface"}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {customer.rank <= 3 && <Star className="h-5 w-5 text-primary fill-primary" />}
                            <span className="font-bold text-lg">#{customer.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{customer.name}</td>
                        <td className="px-6 py-4 text-right">{customer.orderCount}</td>
                        <td className="px-6 py-4 text-right font-bold text-primary">
                          {(customer.totalSpent / 100).toFixed(0)}F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">Mon Miam Miam</h3>
              <p className="text-muted">
                Votre restaurant en ligne préféré pour des repas délicieux livrés rapidement.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary transition-colors">
                    Inscription
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-muted">Email: contact@monmiammiam.fr</p>
              <p className="text-muted">Tél: +33 1 23 45 67 89</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-muted">
            <p>&copy; 2025 Mon Miam Miam. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
