<?php

namespace Database\Seeders;

use App\Models\Employe;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer les IDs des rôles
        $roleEmploye = Role::where('nom_role', 'employe')->first();
        $roleGerant = Role::where('nom_role', 'gerant')->first();
        $roleAdmin = Role::where('nom_role', 'administrateur')->first();

        if (!$roleEmploye || !$roleGerant || !$roleAdmin) {
            $this->command->error('Les rôles doivent être créés avant les employés. Exécutez RoleSeeder d\'abord.');
            return;
        }

        $employes = [
            [
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'email' => 'employee@test.com',
                'telephone' => '0123456789',
                'id_role' => $roleEmploye->id_role,
                'mot_de_passe' => Hash::make('password'),
                'actif' => 'oui',
                'date_embauche' => now(),
            ],
            [
                'nom' => 'Martin',
                'prenom' => 'Sophie',
                'email' => 'manager@test.com',
                'telephone' => '0123456790',
                'id_role' => $roleGerant->id_role,
                'mot_de_passe' => Hash::make('password'),
                'actif' => 'oui',
                'date_embauche' => now(),
            ],
            [
                'nom' => 'Bernard',
                'prenom' => 'Pierre',
                'email' => 'admin@test.com',
                'telephone' => '0123456791',
                'id_role' => $roleAdmin->id_role,
                'mot_de_passe' => Hash::make('password'),
                'actif' => 'oui',
                'date_embauche' => now(),
            ],
        ];

        foreach ($employes as $employe) {
            Employe::firstOrCreate(
                ['email' => $employe['email']],
                $employe
            );
        }

        $this->command->info('Employés de test créés avec succès!');
        $this->command->info('Comptes disponibles:');
        $this->command->info('- Employé: employee@test.com / password');
        $this->command->info('- Manager: manager@test.com / password');
        $this->command->info('- Admin: admin@test.com / password');
    }
}
