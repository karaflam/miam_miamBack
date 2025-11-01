// MODAL À INTÉGRER DANS AdminDashboard.jsx
// Remplacer le modal "showEventModal" existant par celui-ci

{showEventFormModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full my-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">
          {editingEvent ? "Modifier l'événement" : "Nouvel Événement"}
        </h3>
      </div>
      
      <form 
        className="space-y-4" 
        onSubmit={(e) => { 
          e.preventDefault(); 
          handleCreateOrUpdateEvent(); 
        }}
      >
        {/* Type d'événement */}
        <div>
          <label className="block text-sm font-medium mb-2">Type *</label>
          <select
            name="type"
            value={eventFormData.type}
            onChange={handleEventFormChange}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            required
          >
            <option value="evenement">Événement</option>
            <option value="promotion">Promotion</option>
            <option value="jeu">Jeu (Blackjack, Quiz)</option>
          </select>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-2">Titre *</label>
          <input 
            type="text" 
            name="titre"
            value={eventFormData.titre}
            onChange={handleEventFormChange}
            placeholder="Ex: Blackjack, Quiz Culinaire, -20% sur Ndolé" 
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            required 
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea 
            name="description"
            value={eventFormData.description}
            onChange={handleEventFormChange}
            placeholder="Décrivez l'événement, jeu ou promotion..." 
            rows="3" 
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
          ></textarea>
        </div>

        {/* Code promo (pour promotions) */}
        {eventFormData.type === 'promotion' && (
          <div>
            <label className="block text-sm font-medium mb-2">Code Promo</label>
            <input 
              type="text" 
              name="code_promo"
              value={eventFormData.code_promo}
              onChange={handleEventFormChange}
              placeholder="Ex: PROMO20" 
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary uppercase"
            />
          </div>
        )}

        {/* Type de remise et valeur */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type de remise</label>
            <select
              name="type_remise"
              value={eventFormData.type_remise}
              onChange={handleEventFormChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="pourcentage">Pourcentage</option>
              <option value="fixe">Montant fixe</option>
              <option value="point_bonus">Points bonus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Valeur</label>
            <input 
              type="number" 
              name="valeur_remise"
              value={eventFormData.valeur_remise}
              onChange={handleEventFormChange}
              placeholder="Ex: 20" 
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date de début *</label>
            <input 
              type="date" 
              name="date_debut"
              value={eventFormData.date_debut}
              onChange={handleEventFormChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date de fin *</label>
            <input 
              type="date" 
              name="date_fin"
              value={eventFormData.date_fin}
              onChange={handleEventFormChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              required 
            />
          </div>
        </div>

        {/* Limite d'utilisation */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Limite d'utilisation 
            <span className="text-xs text-gray-500 ml-2">
              (0 = illimité, pour jeux = max/jour/user)
            </span>
          </label>
          <input 
            type="number" 
            name="limite_utilisation"
            value={eventFormData.limite_utilisation}
            onChange={handleEventFormChange}
            placeholder="0" 
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            min="0"
          />
        </div>

        {/* Upload affiche */}
        <div>
          <label className="block text-sm font-medium mb-2">Affiche (image)</label>
          <input 
            type="file" 
            name="affiche"
            onChange={handleEventFormChange}
            accept="image/*"
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (max 3MB)</p>
        </div>

        {/* Statut actif */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={eventFormData.active === 'oui'}
            onChange={(e) => handleEventFormChange({
              target: { name: 'active', value: e.target.checked ? 'oui' : 'non' }
            })}
            className="w-5 h-5"
          />
          <label htmlFor="active" className="text-sm font-medium cursor-pointer">
            Activer immédiatement (les étudiants pourront voir cet événement)
          </label>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={() => {
              setShowEventFormModal(false);
              resetEventForm();
            }}
            className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            {editingEvent ? "Modifier" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
