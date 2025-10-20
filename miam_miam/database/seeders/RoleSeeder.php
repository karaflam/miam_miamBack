<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'nom_role' => 'etudiant',
                'description' => 'Utilisateur étudiant - passe des commandes',
            ],
            [
                'nom_role' => 'employe',
                'description' => 'Employé du restaurant - valide commandes et gère menu',
            ],
            [
                'nom_role' => 'gerant',
                'description' => 'Gérant - supervise et crée des employés',
            ],
            [
                'nom_role' => 'administrateur',
                'description' => 'Administrateur - accès complet à toutes les fonctionnalités',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['nom_role' => $role['nom_role']],
                $role
            );
        }
    }
}