/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleur principale - Beige doré #cfbd97
        primary: {
          DEFAULT: '#cfbd97',
          light: '#e0d4b8',
          dark: '#b8a67d',
          50: '#faf8f4',
          100: '#f4f0e7',
          200: '#e8dfc9',
          300: '#dcceab',
          400: '#cfbd97', // DEFAULT
          500: '#c2ac83',
          600: '#b8a67d',
          700: '#9d8b69',
          800: '#7d6e54',
          900: '#5d523f',
        },
        // Couleur secondaire - Noir
        secondary: {
          DEFAULT: '#000000',
          light: '#333333',
          dark: '#000000',
        },
        // Couleurs neutres
        muted: {
          DEFAULT: '#f5f5f5',
          foreground: '#737373',
        },
        border: '#e5e5e5',
        background: '#ffffff',
        foreground: '#000000',
        // Couleurs d'état
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      backgroundColor: {
        'primary-hover': '#b8a67d',
        'secondary-hover': '#1a1a1a',
      },
    },
  },
  plugins: [],
}