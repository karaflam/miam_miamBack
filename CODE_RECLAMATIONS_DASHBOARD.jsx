// ============================================
// CODE COMPLET - GESTION DES RÉCLAMATIONS DANS LES DASHBOARDS
// À intégrer dans EmployeeDashboard, ManagerDashboard, AdminDashboard
// ============================================

// ============================================
// 1. IMPORTS ET ÉTATS
// ============================================

import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle, Clock, User, MessageSquare, X
} from 'lucide-react';

// États
const [reclamations, setReclamations] = useState([]);
const [isLoadingReclamations, setIsLoadingReclamations] = useState(false);
const [reclamationStats, setReclamationStats] = useState(null);
const [selectedReclamationStatus, setSelectedReclamationStatus] = useState('all');
const [showReclamationModal, setShowReclamationModal] = useState(false);
const [selectedReclamation, setSelectedReclamation] = useState(null);
const [statusFormData, setStatusFormData] = useState({
  statut: '',
  commentaire_resolution: ''
});

// ============================================
// 2. FONCTIONS DE RÉCUPÉRATION
// ============================================

const fetchReclamations = async () => {
  setIsLoadingReclamations(true);
  try {
    const token = localStorage.getItem('auth_token');
    let url = 'http://localhost:8000/api/staff/reclamations';
    
    if (selectedReclamationStatus !== 'all') {
      url += `?statut=${selectedReclamationStatus}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setReclamations(data.data);
    }
  } catch (error) {
    console.error('Erreur réclamations:', error);
  } finally {
    setIsLoadingReclamations(false);
  }
};

const fetchReclamationStats = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:8000/api/staff/reclamations/statistics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setReclamationStats(data.data);
    }
  } catch (error) {
    console.error('Erreur stats réclamations:', error);
  }
};

useEffect(() => {
  if (activeTab === "reclamations") {
    fetchReclamations();
    fetchReclamationStats();
  }
}, [activeTab, selectedReclamationStatus]);

// ============================================
// 3. FONCTIONS DE GESTION
// ============================================

const handleUpdateReclamationStatus = async () => {
  if (!statusFormData.statut) {
    alert('Veuillez sélectionner un statut');
    return;
  }

  if (['resolu', 'rejete'].includes(statusFormData.statut) && !statusFormData.commentaire_resolution) {
    alert('Un commentaire est requis pour résoudre ou rejeter une réclamation');
    return;
  }

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/staff/reclamations/${selectedReclamation.id_reclamation}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusFormData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur: ' + (errorData.message || 'Impossible de mettre à jour le statut'));
      return;
    }

    const data = await response.json();
    alert(data.message || 'Statut mis à jour avec succès!');
    setShowReclamationModal(false);
    setSelectedReclamation(null);
    setStatusFormData({ statut: '', commentaire_resolution: '' });
    fetchReclamations();
    fetchReclamationStats();
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la mise à jour du statut');
  }
};

const handleViewReclamation = (reclamation) => {
  setSelectedReclamation(reclamation);
  setStatusFormData({
    statut: reclamation.statut,
    commentaire_resolution: reclamation.commentaire_resolution || ''
  });
  setShowReclamationModal(true);
};

// ============================================
// 4. FONCTIONS UTILITAIRES
// ============================================

const getStatusBadge = (statut) => {
  const badges = {
    'ouvert': 'bg-blue-100 text-blue-700',
    'en_cours': 'bg-yellow-100 text-yellow-700',
    'resolu': 'bg-green-100 text-green-700',
    'rejete': 'bg-red-100 text-red-700'
  };
  const labels = {
    'ouvert': 'Ouvert',
    'en_cours': 'En cours',
    'resolu': 'Résolu',
    'rejete': 'Rejeté'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[statut]}`}>
      {labels[statut]}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// 5. COMPOSANT JSX
// ============================================

// Dans votre switch case pour activeTab === "reclamations":
{activeTab === "reclamations" && (
  <div className="space-y-6">
    {/* En-tête avec statistiques */}
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Réclamations</h2>
      
      {reclamationStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold">{reclamationStats.total}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <p className="text-blue-600 text-sm">Ouvertes</p>
            <p className="text-2xl font-bold text-blue-700">{reclamationStats.ouvert}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-yellow-600 text-sm">En cours</p>
            <p className="text-2xl font-bold text-yellow-700">{reclamationStats.en_cours}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-green-600 text-sm">Résolues</p>
            <p className="text-2xl font-bold text-green-700">{reclamationStats.resolu}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-red-600 text-sm">Rejetées</p>
            <p className="text-2xl font-bold text-red-700">{reclamationStats.rejete}</p>
          </div>
        </div>
      )}
    </div>

    {/* Filtre par statut */}
    <div className="flex gap-4">
      <select
        value={selectedReclamationStatus}
        onChange={(e) => setSelectedReclamationStatus(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="all">Tous les statuts</option>
        <option value="ouvert">Ouvert</option>
        <option value="en_cours">En cours</option>
        <option value="resolu">Résolu</option>
        <option value="rejete">Rejeté</option>
      </select>
    </div>

    {/* Liste des réclamations */}
    {isLoadingReclamations ? (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Chargement des réclamations...</p>
      </div>
    ) : reclamations.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Aucune réclamation</p>
      </div>
    ) : (
      <div className="space-y-4">
        {reclamations.map(reclamation => (
          <div key={reclamation.id_reclamation} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{reclamation.sujet}</h3>
                  {getStatusBadge(reclamation.statut)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {reclamation.utilisateur?.nom} {reclamation.utilisateur?.prenom}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(reclamation.date_ouverture)}
                  </span>
                  {reclamation.id_commande && (
                    <span className="text-blue-600">
                      Commande #{reclamation.id_commande}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-3">{reclamation.description}</p>

                {reclamation.employe_assigne && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Assigné à: {reclamation.employe_assigne.nom} {reclamation.employe_assigne.prenom}</span>
                  </div>
                )}

                {reclamation.commentaire_resolution && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Commentaire de résolution:</p>
                    <p className="text-sm text-gray-600">{reclamation.commentaire_resolution}</p>
                  </div>
                )}

                {reclamation.date_cloture && (
                  <div className="mt-2 text-sm text-gray-500">
                    Clôturée le: {formatDate(reclamation.date_cloture)}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleViewReclamation(reclamation)}
                className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Traiter
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Modal de traitement */}
    {showReclamationModal && selectedReclamation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Traiter la réclamation</h2>
            <button
              onClick={() => {
                setShowReclamationModal(false);
                setSelectedReclamation(null);
                setStatusFormData({ statut: '', commentaire_resolution: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Détails de la réclamation */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">{selectedReclamation.sujet}</h3>
            <p className="text-gray-700 mb-2">{selectedReclamation.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Client: {selectedReclamation.utilisateur?.nom} {selectedReclamation.utilisateur?.prenom}</span>
              <span>Date: {formatDate(selectedReclamation.date_ouverture)}</span>
              {selectedReclamation.id_commande && (
                <span>Commande #{selectedReclamation.id_commande}</span>
              )}
            </div>
          </div>

          {/* Formulaire de traitement */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateReclamationStatus();
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Statut *</label>
              <select
                value={statusFormData.statut}
                onChange={(e) => setStatusFormData({...statusFormData, statut: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionner un statut</option>
                <option value="ouvert">Ouvert</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="rejete">Rejeté</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Commentaire de résolution {['resolu', 'rejete'].includes(statusFormData.statut) && '*'}
              </label>
              <textarea
                value={statusFormData.commentaire_resolution}
                onChange={(e) => setStatusFormData({...statusFormData, commentaire_resolution: e.target.value})}
                required={['resolu', 'rejete'].includes(statusFormData.statut)}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Décrivez la résolution ou la raison du rejet..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReclamationModal(false);
                  setSelectedReclamation(null);
                  setStatusFormData({ statut: '', commentaire_resolution: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)}
