import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFidelite() {
    const [fidelite, setFidelite] = useState({
        points: 0,
        valeur_fcfa: 0,
        loading: true,
        error: null
    });

    const fetchFidelite = async () => {
        try {
            setFidelite(prev => ({ ...prev, loading: true, error: null }));

            // Assurer que Sanctum CSRF cookie est défini (SPA Laravel Sanctum)
            await axios.get('/sanctum/csrf-cookie', { withCredentials: true });

            // Appel API avec envoi des cookies de session
            const response = await axios.get('/api/fidelite/solde', { withCredentials: true });

            setFidelite({
                points: Number(response.data.points) || 0,
                valeur_fcfa: Number(response.data.valeur_fcfa) || 0,
                loading: false,
                error: null
            });
        } catch (error) {
            setFidelite(prev => ({
                ...prev,
                loading: false,
                points: 0,
                valeur_fcfa: 0,
                error:
                    error.response?.status === 401
                        ? 'Utilisateur non authentifié. Veuillez vous reconnecter.'
                        : error.response?.data?.error || 'Erreur lors du chargement des points de fidélité'
            }));
        }
    };

    useEffect(() => {
        fetchFidelite();
    }, []);

    return {
        ...fidelite,
        refetch: fetchFidelite
    };
}
