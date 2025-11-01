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
     * Événements de type 'evenement' qui ne sont pas encore passés
     */
    public function evenementsAVenir()
    {
        $evenements = Evenement::where('type', 'evenement')
            ->where('active', 'oui')
            ->where('date_fin', '>=', now())
            ->orderBy('date_debut', 'asc')
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
        // Récupérer le top 5 des meilleurs clients (accessible sans authentification)
        $top5Clients = $this->top5Clients();
        $top5Data = json_decode($top5Clients->getContent(), true);

        // Récupérer les promotions actives (événements de type promotion)
        $promotions = Evenement::actif()
            ->byType('promotion')
            ->orderBy('date_debut', 'desc')
            ->get();

        // Récupérer les événements à venir (événements de type evenement qui ne sont pas passés)
        $evenements = Evenement::where('type', 'evenement')
            ->where('active', 'oui')
            ->where('date_fin', '>=', now())
            ->orderBy('date_debut', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_clients' => $top5Data['data']['top_clients'] ?? [],
                'promotions_actives' => EvenementResource::collection($promotions),
                'evenements_a_venir' => EvenementResource::collection($evenements),
            ],
        ]);
    }

    /**
     * Retourne le top 5 des meilleurs clients du mois (accessible sans authentification)
     */
    public function top5Clients()
    {
        $dashboardController = new DashboardController();
        $top10Response = $dashboardController->top10Clients();
        $top10Data = json_decode($top10Response->getContent(), true);
        
        // Limiter aux 5 premiers clients
        $top5 = array_slice($top10Data['data']['top_clients'] ?? [], 0, 5);
        
        return response()->json([
            'success' => true,
            'data' => [
                'top_clients' => $top5,
                'mois' => $top10Data['data']['mois'] ?? ''
            ]
        ]);
    }
}
