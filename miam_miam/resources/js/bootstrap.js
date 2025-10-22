import axios from 'axios';

window.axios = axios;

// Configuration globale d'Axios
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Récupérer le token CSRF depuis le meta tag
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Intercepteur pour gérer les erreurs 419
window.axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 419) {
            // Récupérer un nouveau token CSRF
            await window.axios.get('/sanctum/csrf-cookie');
            // Relancer la requête
            return window.axios.request(error.config);
        }
        return Promise.reject(error);
    }
);

export default axios;