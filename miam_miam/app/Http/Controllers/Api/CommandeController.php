<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; // ajouté
use App\Models\Commande;
use App\Models\DetailCommande;
use App\Http\Requests\StoreCommandeRequest;
use App\Http\Resources\CommandeResource;

class CommandeController extends Controller
{
    public function store(StoreCommandeRequest $request)
    {
        DB::beginTransaction();
        try {
            $userId = Auth::id() ?? $request->user()?->id;
            if (!$userId) {
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            $commande = Commande::create([
                'id_utilisateur' => $userId,
                'type_livraison' => $request->type_livraison,
                'heure_arrivee' => $request->heure_arrivee,
                'adresse_livraison' => $request->adresse_livraison,
                'commentaire_client' => $request->commentaire_client,
            ]);

            foreach ($request->articles as $article) {
                DetailCommande::create([
                    'id_commande' => $commande->id_commande,
                    'id_article' => $article['id'],
                    'prix_unitaire' => $article['prix'],
                    'quantite' => $article['quantite'],
                ]);
            }

            $commande->refresh();

            DB::commit();
            return new CommandeResource($commande->load('details'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Récupérer les commandes de l'utilisateur connecté
     */
    public function index()
    {
        try {
            $commandes = Commande::where('id_utilisateur', Auth::id())
                ->with(['details.article', 'utilisateur'])
                ->orderBy('date_commande', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => CommandeResource::collection($commandes)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les détails d'une commande
     */
    public function show($id)
    {
        try {
            $commande = Commande::where('id_commande', $id)
                ->where('id_utilisateur', Auth::id())
                ->with(['details.article', 'utilisateur'])
                ->first();

            if (!$commande) {
                return response()->json([
                    'success' => false,
                    'message' => 'Commande non trouvée'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new CommandeResource($commande)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
