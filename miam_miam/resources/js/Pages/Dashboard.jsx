import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import FideliteCard from '@/Components/FideliteCard';
import { useFidelite } from '@/hooks/useFidelite';
import { useParrainage } from '@/hooks/useParrainage'; // ✅ AJOUTER CETTE LIGNE

export default function Dashboard() {
    const { auth } = usePage().props;
    const { points, valeur_fcfa, loading, error } = useFidelite();
    const { code, filleuls, loading: loadingParrainage, error: errorParrainage } = useParrainage();

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
                        <FideliteCard 
                            points={points} 
                            valeur_fcfa={valeur_fcfa} 
                            loading={loading} 
                            error={error} 
                        />
                        
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white shadow-lg">
                            {loadingParrainage ? (
                                <div className="animate-pulse">
                                    <div className="h-4 bg-white/30 rounded w-1/3 mb-2"></div>
                                    <div className="h-8 bg-white/30 rounded w-1/2"></div>
                                </div>
                            ) : errorParrainage ? (
                                <p className="text-sm text-red-200">{errorParrainage}</p>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold mb-1">Parrainage</h3>
                                    <div className="flex items-baseline">
                                        <span className="text-2xl font-bold">{code || auth.user.code_parrainage}</span>
                                    </div>
                                    <p className="text-sm opacity-90 mt-1">
                                        Partagez ce code pour parrainer vos amis !
                                    </p>
                                    
                                    <div className="mt-4">
                                        <h4 className="font-medium">Mes filleuls ({filleuls.length})</h4>
                                        <ul className="mt-2 space-y-2">
                                            {filleuls.map(f => (
                                                <li key={f.id} className="text-sm bg-white/10 p-2 rounded">
                                                    <div className="flex justify-between">
                                                        <span>{f.nom} {f.prenom}</span>
                                                        <span className="opacity-80 text-xs">
                                                            {f.point_fidelite} pts
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                            {filleuls.length === 0 && (
                                                <li className="text-sm opacity-80">Aucun filleul pour le moment</li>
                                            )}
                                        </ul>
                                    </div>
                                </>
                            )}
                            
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-xs opacity-75">
                                    🎁 5 points bonus pour chaque filleul qui passe sa première commande
                                </p>
                            </div>
                        </div>
                    </div>
                    
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