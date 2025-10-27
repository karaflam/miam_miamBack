<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Retourne les promotions actives pour la home page
     */
    public function promotionsActives()
    {
        // Mock data pour les promotions actives
        $promotions = [
            [
                'id_evenement' => 1,
                'code_promo' => 'BIENVENUE20',
                'titre' => 'Bienvenue chez Miam Miam',
                'description' => 'Profitez de 20% de réduction sur votre première commande',
                'type' => 'promotion',
                'type_remise' => 'pourcentage',
                'valeur_remise' => 20,
                'url_affiche' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
                'date_debut' => '2025-01-01',
                'date_fin' => '2025-12-31',
                'active' => 'oui',
            ],
            [
                'id_evenement' => 2,
                'code_promo' => 'ETUDIANT15',
                'titre' => 'Réduction Étudiante',
                'description' => '15% de réduction pour tous les étudiants',
                'type' => 'promotion',
                'type_remise' => 'pourcentage',
                'valeur_remise' => 15,
                'url_affiche' => 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
                'date_debut' => '2025-01-01',
                'date_fin' => '2025-06-30',
                'active' => 'oui',
            ],
            [
                'id_evenement' => 3,
                'code_promo' => 'WEEKEND10',
                'titre' => 'Happy Weekend',
                'description' => '10% de réduction tous les weekends',
                'type' => 'promotion',
                'type_remise' => 'pourcentage',
                'valeur_remise' => 10,
                'url_affiche' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                'date_debut' => '2025-01-01',
                'date_fin' => '2025-12-31',
                'active' => 'oui',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $promotions,
        ]);
    }

    /**
     * Retourne les événements à venir pour la home page
     */
    public function evenementsAVenir()
    {
        // Mock data pour les événements à venir
        $evenements = [
            [
                'id_evenement' => 10,
                'titre' => 'Festival Gastronomique',
                'description' => 'Découvrez nos nouveaux plats du monde entier',
                'type' => 'evenement',
                'url_affiche' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
                'date_debut' => '2025-11-15',
                'date_fin' => '2025-11-20',
                'active' => 'oui',
                'lieu' => 'Restaurant Miam Miam',
            ],
            [
                'id_evenement' => 11,
                'titre' => 'Soirée Dégustation',
                'description' => 'Une soirée spéciale pour découvrir nos meilleurs plats',
                'type' => 'evenement',
                'url_affiche' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
                'date_debut' => '2025-11-25',
                'date_fin' => '2025-11-25',
                'active' => 'oui',
                'lieu' => 'Restaurant Miam Miam',
            ],
            [
                'id_evenement' => 12,
                'titre' => 'Menu de Noël',
                'description' => 'Réservez votre menu spécial pour les fêtes de fin d\'année',
                'type' => 'evenement',
                'url_affiche' => 'https://www.delizioso.fr/wp-content/uploads/2020/11/Menu-Noel.jpg',
                'date_debut' => '2025-12-20',
                'date_fin' => '2025-12-26',
                'active' => 'oui',
                'lieu' => 'Restaurant Miam Miam',
            ],
            [
                'id_evenement' => 13,
                'titre' => 'Atelier Cuisine',
                'description' => 'Apprenez à cuisiner avec nos chefs professionnels',
                'type' => 'evenement',
                'url_affiche' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
                'date_debut' => '2025-12-05',
                'date_fin' => '2025-12-05',
                'active' => 'oui',
                'lieu' => 'Restaurant Miam Miam',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $evenements,
        ]);
    }

    /**
     * Retourne toutes les données pour la home page (top clients, promotions, événements)
     */
    public function homeData()
    {
        // Récupérer les données du top 10 clients
        $dashboardController = new DashboardController();
        $top10Response = $dashboardController->top10Clients();
        $top10Data = json_decode($top10Response->getContent(), true);

        // Récupérer les promotions actives
        $promotionsResponse = $this->promotionsActives();
        $promotionsData = json_decode($promotionsResponse->getContent(), true);

        // Récupérer les événements à venir
        $evenementsResponse = $this->evenementsAVenir();
        $evenementsData = json_decode($evenementsResponse->getContent(), true);

        return response()->json([
            'success' => true,
            'data' => [
                'top_clients' => $top10Data['data']['top_clients'] ?? [],
                'promotions_actives' => $promotionsData['data'] ?? [],
                'evenements_a_venir' => $evenementsData['data'] ?? [],
            ],
        ]);
    }
}
