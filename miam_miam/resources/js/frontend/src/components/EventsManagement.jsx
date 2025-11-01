// Composant temporaire pour la gestion des événements
// Ce contenu sera intégré dans AdminDashboard.jsx

export const EventsSection = `
<div className="mt-4 lg:mt-0">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
    <div>
      <h2 className="text-2xl font-bold">Gestion des Événements, Promotions & Jeux</h2>
      <p className="text-muted-foreground">Créez et gérez tous vos événements depuis une seule interface</p>
    </div>
    <button
      onClick={() => {
        setEditingEvent(null);
        resetEventForm();
        setShowEventFormModal(true);
      }}
      className="bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Nouvel Événement
    </button>
  </div>

  {/* Filtres par type */}
  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
    <button
      onClick={() => setEventTypeFilter('all')}
      className={\`px-4 py-2 rounded-lg font-semibold transition-colors \${
        eventTypeFilter === 'all' 
          ? 'bg-primary text-secondary' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }\`}
    >
      Tous
    </button>
    <button
      onClick={() => setEventTypeFilter('promotion')}
      className={\`px-4 py-2 rounded-lg font-semibold transition-colors \${
        eventTypeFilter === 'promotion' 
          ? 'bg-primary text-secondary' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }\`}
    >
      <Gift className="w-4 h-4 inline mr-2" />
      Promotions
    </button>
    <button
      onClick={() => setEventTypeFilter('jeu')}
      className={\`px-4 py-2 rounded-lg font-semibold transition-colors \${
        eventTypeFilter === 'jeu' 
          ? 'bg-primary text-secondary' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }\`}
    >
      <Gamepad2 className="w-4 h-4 inline mr-2" />
      Jeux
    </button>
    <button
      onClick={() => setEventTypeFilter('evenement')}
      className={\`px-4 py-2 rounded-lg font-semibold transition-colors \${
        eventTypeFilter === 'evenement' 
          ? 'bg-primary text-secondary' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }\`}
    >
      <Calendar className="w-4 h-4 inline mr-2" />
      Événements
    </button>
  </div>

  {/* Statistiques */}
  <FadeInOnScroll>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Événements</p>
            <p className="text-2xl font-bold">{events.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold">{events.filter(e => e.active === 'oui').length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Promotions</p>
            <p className="text-2xl font-bold">{events.filter(e => e.type === 'promotion').length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jeux</p>
            <p className="text-2xl font-bold">{events.filter(e => e.type === 'jeu').length}</p>
          </div>
        </div>
      </div>
    </div>
  </FadeInOnScroll>

  {/* Liste des événements */}
  {isLoadingEvents ? (
    <div className="text-center py-12">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Chargement des événements...</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events
        .filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter)
        .map((event, index) => (
        <FadeInOnScroll key={event.id_evenement} delay={index * 100}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Image/Affiche */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
              {event.url_affiche ? (
                <img
                  src={event.url_affiche.startsWith('http') ? event.url_affiche : \`http://localhost:8000\${event.url_affiche}\`}
                  alt={event.titre}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {event.type === 'promotion' && <Gift className="w-16 h-16 text-primary" />}
                  {event.type === 'jeu' && <Gamepad2 className="w-16 h-16 text-primary" />}
                  {event.type === 'evenement' && <Calendar className="w-16 h-16 text-primary" />}
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {event.type === 'promotion' && 'Promotion'}
                  {event.type === 'jeu' && 'Jeu'}
                  {event.type === 'evenement' && 'Événement'}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleToggleEvent(event.id_evenement)}
                  className={\`p-2 rounded-full transition-colors \${
                    event.active === 'oui'
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }\`}
                  title={\`\${event.active === 'oui' ? 'Désactiver' : 'Activer'}\`}
                >
                  {event.active === 'oui' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg line-clamp-2">{event.titre}</h3>
                <span className={\`px-2 py-1 text-xs rounded-full \${
                  event.active === 'oui' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }\`}>
                  {event.active === 'oui' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">{event.description || 'Aucune description'}</p>
              
              <div className="space-y-2 mb-4 text-sm">
                {event.code_promo && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="font-mono font-semibold">{event.code_promo}</span>
                  </div>
                )}
                {event.valeur_remise && (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span>
                      {event.type_remise === 'pourcentage' && \`-\${event.valeur_remise}%\`}
                      {event.type_remise === 'fixe' && \`-\${event.valeur_remise} FCFA\`}
                      {event.type_remise === 'point_bonus' && \`+\${event.valeur_remise} points\`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">
                    {new Date(event.date_debut).toLocaleDateString('fr-FR')} - {new Date(event.date_fin).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {event.limite_utilisation > 0 && (
                  <div className="text-xs text-gray-500">
                    Limite: {event.nombre_utilisation || 0} / {event.limite_utilisation}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openEditEventModal(event)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id_evenement)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </FadeInOnScroll>
      ))}
    </div>
  )}

  {events.filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter).length === 0 && !isLoadingEvents && (
    <div className="text-center py-12 bg-white rounded-xl">
      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
      <p className="text-muted-foreground text-lg">Aucun événement trouvé</p>
      <button
        onClick={() => {
          setEditingEvent(null);
          resetEventForm();
          setShowEventFormModal(true);
        }}
        className="mt-4 inline-flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
      >
        <Plus className="w-5 h-5" />
        Créer un événement
      </button>
    </div>
  )}
</div>
`;
