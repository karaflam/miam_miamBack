import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Cancel() {
    return (
        <AuthenticatedLayout>
            <Head title="Paiement annulé" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-center">
                            <div className="text-red-500 text-6xl mb-4">✗</div>
                            <h1 className="text-2xl font-bold mb-4">Paiement annulé</h1>
                            <p className="text-gray-600 mb-6">
                                Votre paiement a été annulé. Aucun montant n'a été débité.
                            </p>
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