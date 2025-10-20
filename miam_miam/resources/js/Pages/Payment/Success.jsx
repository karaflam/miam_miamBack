import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Success({ transaction_id }) {
    return (
        <AuthenticatedLayout>
            <Head title="Paiement réussi" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-center">
                            <div className="text-green-500 text-6xl mb-4">✓</div>
                            <h1 className="text-2xl font-bold mb-4">Paiement réussi !</h1>
                            <p className="text-gray-600 mb-6">
                                Votre commande a été payée avec succès.
                            </p>
                            {transaction_id && (
                                <div className="text-sm text-gray-500 mb-6">
                                    Transaction ID: {transaction_id}
                                </div>
                            )}
                            <Link
                                href="/dashboard"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                            >
                                Retour au tableau de bord
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}