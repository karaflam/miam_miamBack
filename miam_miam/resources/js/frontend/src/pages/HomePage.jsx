import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Trophy, Tag, ArrowRight, Loader2, Star, Crown, Medal, Award, Calendar, Gift, MapPin } from "lucide-react"
import CustomCarousel from "../components/CustomCarousel"
import FadeInOnScroll from "../components/FadeInOnScroll"
import { useAuth } from "../context/AuthContext"

export default function HomePage() {
  const {user} = useAuth();
  const [menuItems, setMenuItems] = useState([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [topClients, setTopClients] = useState([])
  const [promotions, setPromotions] = useState([])
  const [evenements, setEvenements] = useState([])
  const [isLoadingHomeData, setIsLoadingHomeData] = useState(false)

  useEffect(() => {
    fetchMenuItems();
    fetchHomeData();
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

  const fetchHomeData = async () => {
    setIsLoadingHomeData(true);
    try {
      const response = await fetch('http://localhost:8000/api/home-data', {
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setTopClients(result.data.top_clients?.slice(0, 5) || []); // Top 5 pour la home
        
        // Les promotions actives sont des événements de type 'promotion' avec active='oui'
        // EvenementResource::collection retourne un tableau directement
        const promotionsData = result.data.promotions_actives;
        setPromotions(Array.isArray(promotionsData) ? promotionsData : []);
        
        // Les événements à venir sont des événements de type 'evenement' avec active='oui'
        const evenementsData = result.data.evenements_a_venir;
        setEvenements(Array.isArray(evenementsData) ? evenementsData : []);
      }
    } catch (error) {
      console.error('Erreur chargement données home:', error);
    } finally {
      setIsLoadingHomeData(false);
    }
  };

  const getRankIcon = (rang) => {
    switch (rang) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rang}</span>;
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

      {/* Promotions Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <div className="flex items-center gap-3 mb-8">
              <Gift className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Promotions Actives</h2>
            </div>
          </FadeInOnScroll>
          
          {isLoadingHomeData ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des promotions...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
              <p className="text-muted-foreground text-lg">Aucune promotion disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo, index) => (
                <FadeInOnScroll key={promo.id_evenement} delay={index * 100}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/20">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={promo.url_affiche ? (promo.url_affiche.startsWith('http') ? promo.url_affiche : `http://localhost:8000${promo.url_affiche}`) : '/placeholder.svg'} 
                        alt={promo.titre}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = '/placeholder.svg'}
                      />
                      {promo.valeur_remise && promo.type_remise === 'pourcentage' && (
                        <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                          -{promo.valeur_remise}%
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{promo.titre}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">{promo.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                          <Tag className="w-4 h-4" />
                          <span className="text-sm font-mono">{promo.code_promo}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Valide jusqu'au {new Date(promo.date_fin).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Événements à Venir</h2>
            </div>
          </FadeInOnScroll>
          
          {isLoadingHomeData ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des événements...</p>
            </div>
          ) : evenements.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
              <p className="text-muted-foreground text-lg">Aucun événement prévu pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {evenements.map((event, index) => (
                <FadeInOnScroll key={event.id_evenement} delay={index * 100}>
                  <div className="bg-muted rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={event.url_affiche ? (event.url_affiche.startsWith('http') ? event.url_affiche : `http://localhost:8000${event.url_affiche}`) : '/placeholder.svg'} 
                        alt={event.titre}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = '/placeholder.svg'}
                      />
                      <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Événement
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 text-gray-900">{event.titre}</h3>
                      <p className="text-muted-foreground mb-4 text-sm line-clamp-2">{event.description}</p>
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                            {event.date_debut !== event.date_fin && 
                              ` - ${new Date(event.date_fin).toLocaleDateString('fr-FR')}`
                            }
                          </span>
                        </div>
                        {event.code_promo && (
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" />
                            <span className="font-mono">{event.code_promo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Customers Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Top Clients du Mois</h2>
            </div>
          </FadeInOnScroll>
          {isLoadingHomeData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : topClients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Aucune commande ce mois-ci</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {topClients.map((client, index) => (
                <FadeInOnScroll key={client.id} delay={index * 120}>
                  <div className={`
                    bg-muted rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105
                    ${client.rang <= 3 ? 'border-2 border-primary/30' : ''}
                  `}>
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                        {client.prenom.charAt(0)}{client.nom.charAt(0)}
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg">
                        {getRankIcon(client.rang)}
                      </div>
                    </div>
                    <h3 className="font-bold mb-1 text-gray-900">{client.nom_complet}</h3>
                    <div className="flex items-center justify-center gap-1 text-yellow-600 mb-2">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="font-semibold">{client.points_fidelite} pts</span>
                    </div>
                    <div className="text-primary font-bold text-sm">
                      {client.total_depense.toLocaleString()} F
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {client.nombre_commandes} commande{client.nombre_commandes > 1 ? 's' : ''}
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          )}
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
            {!user &&(
            <div className="flex gap-6 text-sm">
              <Link to="/student-login" className="hover:text-white transition-colors">
                Espace Étudiant
              </Link>
              <Link to="/staff-login" className="hover:text-white transition-colors">
                Espace Staff
              </Link>
            </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
