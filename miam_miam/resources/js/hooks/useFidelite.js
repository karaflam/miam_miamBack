import { useState, useEffect } from 'react';
import axios from 'axios';

// Set withCredentials to true globally
axios.defaults.withCredentials = true;

export function useFidelite() {
    const [fidelite, setFidelite] = useState({
        points: 0,
        valeur_fcfa: 0,
        loading: true,
        error: null
    });

    const fetchFidelite = async () => {
        try {
            // Get CSRF cookie first
            await axios.get('/sanctum/csrf-cookie');
            
            const response = await axios.get('/api/fidelite/solde', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (response.data && typeof response.data.points !== 'undefined') {
                setFidelite({
                    points: Number(response.data.points),
                    valeur_fcfa: Number(response.data.valeur_fcfa),
                    loading: false,
                    error: null
                });
            } else {
                throw new Error('Format de réponse invalide');
            }
        } catch (error) {
            console.error('Erreur fidélité:', error);
            setFidelite(prev => ({
                ...prev,
                loading: false,
                points: 0,
                valeur_fcfa: 0,
                error: error.response?.status === 404 ? 
                    'Service de fidélité non disponible' : 
                    error.response?.data?.message || 'Erreur lors du chargement des points'
            }));
        }
    };

    useEffect(() => {
        fetchFidelite();
    }, []);

    return fidelite;
}
