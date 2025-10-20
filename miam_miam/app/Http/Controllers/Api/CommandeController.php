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
}
