import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Award, Crown, Medal, Calendar, CalendarDays } from 'lucide-react';

const Top10Clients = () => {
  const [topClients, setTopClients] = useState([]);
  const [periode, setPeriode] = useState('');
  const [periodeType, setPeriodeType] = useState('mois'); // 'mois' ou 'semaine'
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchTop10 = async (typePeriode = 'mois') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/top10-clients?periode=${typePeriode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setTopClients(result.data.top_clients);
        setPeriode(result.data.periode);
        setPeriodeType(result.data.type_periode || typePeriode);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du top 10:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUserId(user.id_utilisateur || user.id);
    
    // Charger les données
    fetchTop10(periodeType);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriodeChange = (newPeriode) => {
    setPeriodeType(newPeriode);
    fetchTop10(newPeriode);
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

  const getRankBadgeColor = (rang) => {
    switch (rang) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-yellow-600 p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Top 10 Clients</h2>
              <p className="text-sm opacity-90">{periode}</p>
            </div>
          </div>
          
          {/* Filtres de période */}
          <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => handlePeriodeChange('semaine')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200
                ${periodeType === 'semaine' 
                  ? 'bg-white text-primary shadow-md' 
                  : 'text-white hover:bg-white/10'
                }
              `}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Semaine</span>
            </button>
            <button
              onClick={() => handlePeriodeChange('mois')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200
                ${periodeType === 'mois' 
                  ? 'bg-white text-primary shadow-md' 
                  : 'text-white hover:bg-white/10'
                }
              `}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Mois</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="p-6">
        {topClients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">
              Aucune commande {periodeType === 'semaine' ? 'cette semaine' : 'ce mois-ci'}
            </p>
            <p className="text-sm">Soyez le premier à commander !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topClients.map((client) => (
              <div
                key={client.id}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all duration-300
                  ${client.id === currentUserId 
                    ? 'bg-primary/10 border-2 border-primary shadow-md scale-105' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }
                  ${client.rang <= 3 ? 'shadow-lg' : ''}
                `}
              >
                {/* Rang */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full
                  ${getRankBadgeColor(client.rang)}
                  flex-shrink-0
                `}>
                  {getRankIcon(client.rang)}
                </div>

                {/* Informations client */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {client.nom_complet}
                    </p>
                    {client.id === currentUserId && (
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        Vous
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {client.points_fidelite} pts
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{client.nombre_commandes} commande{client.nombre_commandes > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Montant total */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-primary">
                    {client.total_depense.toLocaleString()} F
                  </p>
                  <p className="text-xs text-gray-500">Total dépensé</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-500" />
          <p>
            Gagnez des points de fidélité à chaque commande et montez dans le classement !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Top10Clients;
