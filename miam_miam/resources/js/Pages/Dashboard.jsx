import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props; // Récupérer les props Inertia, dont l'utilisateur

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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 text-gray-900">
                        <p>You're logged in!</p>
                        <div className="mt-4">
                            <p>
                                Votre code de parrainage :{' '}
                                <strong>{auth.user.code_parrainage}</strong>
                            </p>
                            <p>Partagez ce code pour parrainer vos amis !</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
