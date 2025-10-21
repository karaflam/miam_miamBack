import { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

export function useParrainage() {
    const [state, setState] = useState({
        code: null,
        filleuls: [],
        loading: true,
        error: null
    });

    const fetch = async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            await axios.get('/sanctum/csrf-cookie'); // si SPA / sanctum
            const res = await axios.get('/api/parrainage/mon-code', { withCredentials: true });
            setState({
                code: res.data.code ?? null,
                filleuls: res.data.filleuls ?? [],
                loading: false,
                error: null
            });
        } catch (e) {
            setState(s => ({ ...s, loading: false, error: e.response?.data?.message || e.message }));
        }
    };

    useEffect(() => { fetch(); }, []);

    return { ...state, refetch: fetch };
}