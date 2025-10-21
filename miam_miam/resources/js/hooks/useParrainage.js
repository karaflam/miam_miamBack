import { useState, useEffect } from 'react';
import axios from '../bootstrap';

export function useParrainage() {
    const [state, setState] = useState({
        code: null,
        filleuls: [],
        loading: true,
        error: null
    });

    const fetchParrainage = async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            
            // Récupérer le code de parrainage
            const codeResponse = await axios.get('/api/parrainage/mon-code');
            
            // Récupérer les filleuls
            const filleulsResponse = await axios.get('/api/parrainage/mes-filleuls');
            
            setState({
                code: codeResponse.data.code,
                filleuls: filleulsResponse.data.data || [],
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Erreur parrainage:', error);
            setState(s => ({ 
                ...s, 
                loading: false, 
                error: error.response?.data?.message || 'Erreur lors du chargement'
            }));
        }
    };

    useEffect(() => {
        fetchParrainage();
    }, []);

    return { ...state, refetch: fetchParrainage };
}