<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Services\JeuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JeuxController extends Controller
{
    protected $jeuService;

    public function __construct(JeuService $jeuService)
    {
        $this->jeuService = $jeuService;
    }

    /**
     * Liste des jeux disponibles
     */
    public function index()
    {
        $userId = Auth::id();
        
        $jeux = Evenement::jeux()
            ->actif()
            ->get()
            ->map(function ($jeu) use ($userId) {
                return [
                    'id' => $jeu->id_evenement,
                    'titre' => $jeu->titre,
                    'description' => $jeu->description,
                    'image' => $jeu->url_affiche,
                    'type_remise' => $jeu->type_remise,
                    'valeur_remise' => $jeu->valeur_remise,
                    'date_debut' => $jeu->date_debut,
                    'date_fin' => $jeu->date_fin,
                    'limite_essais_jour' => $jeu->limite_utilisation,
                    'essais_utilises_aujourdhui' => $jeu->getUtilisationsAujourdhui($userId),
                    'essais_restants' => $jeu->utilisationsRestantesAujourdhui($userId),
                    'peut_jouer' => $jeu->peutEtreUtiliseParUtilisateur($userId),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $jeux
        ]);
    }

    /**
     * Détails d'un jeu
     */
    public function show($id)
    {
        $userId = Auth::id();
        $jeu = Evenement::jeux()->actif()->findOrFail($id);

        $verification = $this->jeuService->peutJouer($id, $userId);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $jeu->id_evenement,
                'titre' => $jeu->titre,
                'description' => $jeu->description,
                'image' => $jeu->url_affiche,
                'type_remise' => $jeu->type_remise,
                'valeur_remise' => $jeu->valeur_remise,
                'date_debut' => $jeu->date_debut,
                'date_fin' => $jeu->date_fin,
                'limite_essais_jour' => $jeu->limite_utilisation,
                'essais_utilises_aujourdhui' => $jeu->getUtilisationsAujourdhui($userId),
                'essais_restants' => $verification['essais_restants'] ?? 0,
                'peut_jouer' => $verification['peut_jouer'],
                'raison' => $verification['raison'] ?? null,
            ]
        ]);
    }

    /**
     * Jouer à un jeu
     */
    public function jouer(Request $request, $id)
    {
        $request->validate([
            'a_gagne' => 'required|boolean',
            'gain' => 'nullable|numeric',
        ]);

        try {
            $userId = Auth::id();
            
            $resultat = $this->jeuService->enregistrerParticipation(
                $id,
                $userId,
                $request->a_gagne,
                $request->gain
            );

            return response()->json($resultat);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Historique des participations de l'utilisateur
     */
    public function mesParticipations()
    {
        $userId = Auth::id();

        $participations = \App\Models\UsagePromo::where('id_utilisateur', $userId)
            ->whereHas('evenement', function ($query) {
                $query->where('type', 'jeu');
            })
            ->with('evenement')
            ->orderBy('date_utilisation', 'desc')
            ->get()
            ->map(function ($usage) {
                return [
                    'id' => $usage->id_usage,
                    'jeu' => [
                        'id' => $usage->evenement->id_evenement,
                        'titre' => $usage->evenement->titre,
                        'image' => $usage->evenement->url_affiche,
                    ],
                    'date' => $usage->date_utilisation,
                    'montant_remise' => $usage->montant_remise,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $participations
        ]);
    }
}