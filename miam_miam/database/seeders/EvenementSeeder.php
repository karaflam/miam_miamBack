<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Evenement;
use Carbon\Carbon;

class EvenementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $evenements = [
            // Promotions actives
            [
                'code_promo' => 'BIENVENUE20',
                'titre' => 'Bienvenue chez Miam Miam',
                'description' => 'Profitez de 20% de réduction sur votre première commande',
                'type' => 'promotion',
                'type_remise' => 'pourcentage',
                'valeur_remise' => 20.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
                'date_debut' => '2025-01-01',
                'date_fin' => '2025-12-31',
                'active' => 'oui',
                'limite_utilisation' => 1000,
                'nombre_utilisation' => 45,
            ],
            [
                'code_promo' => 'ETUDIANT15',
                'titre' => 'Réduction Étudiante',
                'description' => '15% de réduction pour tous les étudiants',
                'type' => 'promotion',
                'type_remise' => 'pourcentage',
                'valeur_remise' => 15.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
                'date_debut' => '2025-01-01',
                'date_fin' => '2025-06-30',
                'active' => 'oui',
                'limite_utilisation' => 500,
                'nombre_utilisation' => 78,
            ],
            [
                'code_promo' => 'WEEKEND10',
                'titre' => 'Happy Weekend',
                'description' => '10% de réduction tous les weekends',
                'type' => 'promotion',
                'type_remise' => 'pourcentage',
                'valeur_remise' => 10.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                'date_debut' => '2025-01-01',
                'date_fin' => '2025-12-31',
                'active' => 'oui',
                'limite_utilisation' => 2000,
                'nombre_utilisation' => 156,
            ],
            [
                'code_promo' => 'NOEL25',
                'titre' => 'Spécial Noël',
                'description' => '25% de réduction pour les fêtes de fin d\'année',
                'type' => 'promotion',
                'type_remise' => 'pourcentage',
                'valeur_remise' => 25.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1482275548304-a58859dc31b7?w=800',
                'date_debut' => '2024-12-15',
                'date_fin' => '2025-01-05',
                'active' => 'non',
                'limite_utilisation' => 300,
                'nombre_utilisation' => 234,
            ],
            [
                'code_promo' => 'FIDELITE500',
                'titre' => 'Bonus Fidélité',
                'description' => '500 FCFA de réduction pour les clients fidèles',
                'type' => 'promotion',
                'type_remise' => 'fixe',
                'valeur_remise' => 500.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
                'date_debut' => '2025-01-01',
                'date_fin' => '2025-12-31',
                'active' => 'oui',
                'limite_utilisation' => 1500,
                'nombre_utilisation' => 89,
            ],

            // Événements
            [
                'code_promo' => null,
                'titre' => 'Festival Gastronomique',
                'description' => 'Découvrez nos nouveaux plats du monde entier. Une semaine dédiée à la découverte culinaire avec des spécialités camerounaises et internationales.',
                'type' => 'evenement',
                'type_remise' => null,
                'valeur_remise' => 0.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
                'date_debut' => '2025-11-15',
                'date_fin' => '2025-11-20',
                'active' => 'oui',
                'limite_utilisation' => 0,
                'nombre_utilisation' => 0,
            ],
            [
                'code_promo' => null,
                'titre' => 'Soirée Dégustation',
                'description' => 'Une soirée spéciale pour découvrir nos meilleurs plats camerounais. Venez goûter le Ndolé, le Poulet DG et bien d\'autres délices.',
                'type' => 'evenement',
                'type_remise' => null,
                'valeur_remise' => 0.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
                'date_debut' => '2025-11-25',
                'date_fin' => '2025-11-25',
                'active' => 'oui',
                'limite_utilisation' => 0,
                'nombre_utilisation' => 0,
            ],
            [
                'code_promo' => null,
                'titre' => 'Menu de Noël',
                'description' => 'Réservez votre menu spécial pour les fêtes de fin d\'année. Des plats traditionnels revisités pour célébrer Noël en famille.',
                'type' => 'evenement',
                'type_remise' => null,
                'valeur_remise' => 0.00,
                'url_affiche' => 'https://www.delizioso.fr/wp-content/uploads/2020/11/Menu-Noel.jpg',
                'date_debut' => '2025-12-20',
                'date_fin' => '2025-12-26',
                'active' => 'oui',
                'limite_utilisation' => 0,
                'nombre_utilisation' => 0,
            ],
            [
                'code_promo' => null,
                'titre' => 'Atelier Cuisine Camerounaise',
                'description' => 'Apprenez à cuisiner les plats traditionnels camerounais avec nos chefs professionnels. Inscriptions limitées.',
                'type' => 'evenement',
                'type_remise' => null,
                'valeur_remise' => 0.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
                'date_debut' => '2025-12-05',
                'date_fin' => '2025-12-05',
                'active' => 'oui',
                'limite_utilisation' => 0,
                'nombre_utilisation' => 0,
            ],
            [
                'code_promo' => null,
                'titre' => 'Journée Portes Ouvertes',
                'description' => 'Venez découvrir les coulisses de Miam Miam ! Visitez nos cuisines, rencontrez nos chefs et dégustez nos spécialités.',
                'type' => 'evenement',
                'type_remise' => null,
                'valeur_remise' => 0.00,
                'url_affiche' => 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
                'date_debut' => '2025-11-10',
                'date_fin' => '2025-11-10',
                'active' => 'oui',
                'limite_utilisation' => 0,
                'nombre_utilisation' => 0,
            ],
        ];

        foreach ($evenements as $evt) {
            Evenement::firstOrCreate(
                ['titre' => $evt['titre']],
                $evt
            );
        }

        $this->command->info('Événements et promotions créés avec succès!');
        $this->command->info('- 5 promotions (3 actives, 1 expirée)');
        $this->command->info('- 5 événements à venir');
    }
}
