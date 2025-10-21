import React from 'react';

export default function FideliteCard({ points, valeur_fcfa, loading, error }) {
    // Formatage sécurisé des valeurs
    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString();
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg">
                <div className="animate-pulse">
                    <div className="h-4 bg-white/30 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-white/30 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-white/30 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Erreur</span>
                </div>
                <p className="mt-2 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Points de Fidélité</h3>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold">{formatNumber(points)}</span>
                        <span className="text-lg ml-2 opacity-90">pts</span>
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                        Valeur: {formatNumber(valeur_fcfa)} FCFA
                    </p>
                </div>
                <div className="text-right">
                    <div className="bg-white/20 rounded-full p-3">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-75">
                    💡 15 points = 1000 FCFA • 1000 FCFA dépensés = 1 point gagné
                </p>
            </div>
        </div>
    );
}
