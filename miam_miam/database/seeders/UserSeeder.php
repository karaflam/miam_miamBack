<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Utilisateur de test original
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'nom' => 'Test',
                'prenom' => 'User',
                'email' => 'test@example.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '123456789',
                'code_parrainage' => 'TEST123',
                'point_fidelite' => 0,
                'solde' => 10000,
                'statut' => 'actif',
            ]
        );

        // Utilisateurs camerounais plus anciens (inscrits il y a 6-12 mois)
        $utilisateursCamerounais = [
            [
                'nom' => 'Mbarga',
                'prenom' => 'Alain',
                'email' => 'alain.mbarga@etudiant.cm',
                'telephone' => '237670123456',
                'code_parrainage' => 'MBAALAI001',
                'point_fidelite' => 150,
                'solde' => 25000,
                'created_at' => now()->subMonths(10),
            ],
            [
                'nom' => 'Ngo Biyong',
                'prenom' => 'Marie',
                'email' => 'marie.ngobiyong@etudiant.cm',
                'telephone' => '237675234567',
                'code_parrainage' => 'NGOMARR002',
                'point_fidelite' => 200,
                'solde' => 30000,
                'created_at' => now()->subMonths(11),
            ],
            [
                'nom' => 'Fotso',
                'prenom' => 'Jean-Pierre',
                'email' => 'jeanpierre.fotso@etudiant.cm',
                'telephone' => '237678345678',
                'code_parrainage' => 'FOTJEAN003',
                'point_fidelite' => 180,
                'solde' => 20000,
                'created_at' => now()->subMonths(9),
            ],
            [
                'nom' => 'Kamga',
                'prenom' => 'Sylvie',
                'email' => 'sylvie.kamga@etudiant.cm',
                'telephone' => '237680456789',
                'code_parrainage' => 'KAMSYLV004',
                'point_fidelite' => 220,
                'solde' => 35000,
                'created_at' => now()->subMonths(12),
            ],
            [
                'nom' => 'Tchoumi',
                'prenom' => 'Patrick',
                'email' => 'patrick.tchoumi@etudiant.cm',
                'telephone' => '237682567890',
                'code_parrainage' => 'TCHPAT005',
                'point_fidelite' => 160,
                'solde' => 18000,
                'created_at' => now()->subMonths(8),
            ],
            [
                'nom' => 'Njoya',
                'prenom' => 'Fatima',
                'email' => 'fatima.njoya@etudiant.cm',
                'telephone' => '237685678901',
                'code_parrainage' => 'NJOFAT006',
                'point_fidelite' => 190,
                'solde' => 28000,
                'created_at' => now()->subMonths(10),
            ],
            [
                'nom' => 'Ebong',
                'prenom' => 'Emmanuel',
                'email' => 'emmanuel.ebong@etudiant.cm',
                'telephone' => '237687789012',
                'code_parrainage' => 'EBOEMAN007',
                'point_fidelite' => 170,
                'solde' => 22000,
                'created_at' => now()->subMonths(7),
            ],
            [
                'nom' => 'Mbassi',
                'prenom' => 'Claudine',
                'email' => 'claudine.mbassi@etudiant.cm',
                'telephone' => '237690890123',
                'code_parrainage' => 'MBACLA008',
                'point_fidelite' => 210,
                'solde' => 32000,
                'created_at' => now()->subMonths(11),
            ],
            [
                'nom' => 'Atangana',
                'prenom' => 'Roger',
                'email' => 'roger.atangana@etudiant.cm',
                'telephone' => '237692901234',
                'code_parrainage' => 'ATAROG009',
                'point_fidelite' => 140,
                'solde' => 15000,
                'created_at' => now()->subMonths(6),
            ],
            [
                'nom' => 'Bella',
                'prenom' => 'Nadège',
                'email' => 'nadege.bella@etudiant.cm',
                'telephone' => '237695012345',
                'code_parrainage' => 'BELNAD010',
                'point_fidelite' => 230,
                'solde' => 40000,
                'created_at' => now()->subMonths(12),
            ],
        ];

        foreach ($utilisateursCamerounais as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                array_merge($user, [
                    'mot_de_passe' => Hash::make('password'),
                    'statut' => 'actif',
                ])
            );
        }

        $this->command->info('Utilisateurs créés avec succès!');
        $this->command->info('- 1 utilisateur de test');
        $this->command->info('- 10 utilisateurs camerounais anciens (6-12 mois)');
    }
}