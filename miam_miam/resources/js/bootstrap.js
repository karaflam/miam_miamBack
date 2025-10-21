import axios from 'axios';

// Configuration globale d'axios
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Interceptor pour inclure le CSRF token
axios.interceptors.request.use(config => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token.content;
    } else {
        console.warn('CSRF token not found');
    }
    
    return config;
});

export default axios;