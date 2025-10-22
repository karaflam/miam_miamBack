import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialiser le CSRF cookie AVANT de créer l'app
(async () => {
    try {
        // Récupérer le cookie CSRF
        await axios.get('/sanctum/csrf-cookie');
        
        // Créer l'application Inertia
        createInertiaApp({
            title: (title) => `${title} - ${appName}`,
            resolve: (name) =>
                resolvePageComponent(
                    `./Pages/${name}.jsx`,
                    import.meta.glob('./Pages/**/*.jsx'),
                ),
            setup({ el, App, props }) {
                const root = createRoot(el);
                root.render(<App {...props} />);
            },
            progress: {
                color: '#4B5563',
            },
        });
    } catch (error) {
        console.error('Failed to initialize CSRF:', error);
        // Créer l'app quand même
        createInertiaApp({
            title: (title) => `${title} - ${appName}`,
            resolve: (name) =>
                resolvePageComponent(
                    `./Pages/${name}.jsx`,
                    import.meta.glob('./Pages/**/*.jsx'),
                ),
            setup({ el, App, props }) {
                const root = createRoot(el);
                root.render(<App {...props} />);
            },
            progress: {
                color: '#4B5563',
            },
        });
    }
})();