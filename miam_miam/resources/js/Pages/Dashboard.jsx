import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import FideliteCard from '@/Components/FideliteCard';
import { useFidelite } from '@/hooks/useFidelite';

export default function Dashboard() {
    const { auth } = usePage().props; // Récupérer les props Inertia, dont l'utilisateur
    const { points, valeur_fcfa, loading, error } = useFidelite();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Carte des points de fidélité */}
                        <FideliteCard 
                            points={points} 
                            valeur_fcfa={valeur_fcfa} 
                            loading={loading} 
                            error={error} 
                        />
                        
                        {/* Carte du parrainage */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Parrainage</h3>
                                    <div className="flex items-baseline">
                                        <span className="text-2xl font-bold">{auth.user.code_parrainage}</span>
                                    </div>
                                    <p className="text-sm opacity-90 mt-1">
                                        Partagez ce code pour parrainer vos amis !
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white/20 rounded-full p-3">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-xs opacity-75">
                                    🎁 5 points bonus pour chaque filleul qui passe sa première commande
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section d'informations générales */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 text-gray-900">
                        <h3 className="text-lg font-semibold mb-4">Bienvenue sur votre tableau de bord !</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Comment gagner des points ?</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• 1 point pour chaque 1000 FCFA dépensés</li>
                                    <li>• 5 points bonus pour parrainer un ami</li>
                                    <li>• Points valables 12 mois</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Comment utiliser vos points ?</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• 15 points = 1000 FCFA de réduction</li>
                                    <li>• Utilisables lors du paiement</li>
                                    <li>• Pas de limite d'utilisation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
