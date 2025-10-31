<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Http\Resources\EvenementResource;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Retourne les promotions actives pour la home page
     * Seules les promotions configurées par l'admin et actives sont retournées
     */
    public function promotionsActives()
    {
        $promotions = Evenement::actif()
            ->byType('promotion')
            ->orderBy('date_debut', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => EvenementResource::collection($promotions),
        ]);
    }

    /**
     * Retourne les événements à venir pour la home page
     * Seuls les événements configurés par l'admin et actifs sont retournés
     */
    public function evenementsAVenir()
    {
        $evenements = Evenement::actif()
            ->where('type', 'evenement')
            ->orderBy('date_debut', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => EvenementResource::collection($evenements),
        ]);
    }

    /**
     * Retourne toutes les données pour la home page (top clients, promotions, événements)
     * Tous les éléments retournés sont des événements configurés par l'admin et actifs
     */
    public function homeData()
    {
        // Récupérer les données du top 10 clients
        $dashboardController = new DashboardController();
        $top10Response = $dashboardController->top10Clients();
        $top10Data = json_decode($top10Response->getContent(), true);

        // Récupérer les promotions actives (événements de type promotion)
        $promotions = Evenement::actif()
            ->byType('promotion')
            ->orderBy('date_debut', 'desc')
            ->get();

        // Récupérer les événements à venir (événements de type evenement)
        $evenements = Evenement::actif()
            ->where('type', 'evenement')
            ->orderBy('date_debut', 'desc')
            ->get();

        // Récupérer les jeux actifs (événements de type jeu)
        $jeux = Evenement::actif()
            ->byType('jeu')
            ->orderBy('date_debut', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_clients' => $top10Data['data']['top_clients'] ?? [],
                'promotions_actives' => EvenementResource::collection($promotions),
                'evenements_a_venir' => EvenementResource::collection($evenements),
                'jeux_actifs' => EvenementResource::collection($jeux),
            ],
        ]);
    }
}
