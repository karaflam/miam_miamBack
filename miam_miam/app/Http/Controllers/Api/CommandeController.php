<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\Commande;
use App\Models\DetailCommande;
use App\Models\Stock;
use App\Models\Menu;
use App\Models\User;
use App\Models\SuiviPoint;
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

            $user = User::find($userId);
            if (!$user) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Vérifier la disponibilité du stock avant de créer la commande
            foreach ($request->articles as $article) {
                $menu = Menu::find($article['id']);
                if (!$menu) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Article non trouvé: ' . $article['id']
                    ], 404);
                }

                $stock = Stock::where('id_article', $article['id'])->first();
                if ($stock) {
                    if ($stock->quantite_disponible < $article['quantite']) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Stock insuffisant pour: ' . $menu->nom_article . ' (disponible: ' . $stock->quantite_disponible . ', demandé: ' . $article['quantite'] . ')'
                        ], 400);
                    }
                }
            }

            // Calculer le montant total
            $montantTotal = 0;
            foreach ($request->articles as $article) {
                $montantTotal += $article['prix'] * $article['quantite'];
            }

            // Gérer l'utilisation des points de fidélité
            $pointsUtilises = $request->points_utilises ?? 0;
            $montantRemise = 0;

            if ($pointsUtilises > 0) {
                // Vérifier que l'utilisateur a assez de points
                if ($user->point_fidelite < $pointsUtilises) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Points de fidélité insuffisants. Vous avez ' . $user->point_fidelite . ' points.'
                    ], 400);
                }

                // 1 point = 100 FCFA de réduction
                $montantRemise = $pointsUtilises * 100;

                // La remise ne peut pas dépasser le montant total
                if ($montantRemise > $montantTotal) {
                    $montantRemise = $montantTotal;
                    $pointsUtilises = ceil($montantTotal / 100);
                }
            }

            $montantFinal = $montantTotal - $montantRemise;

            // Vérifier que l'utilisateur a assez de solde
            if ($user->solde < $montantFinal) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Solde insuffisant. Montant requis: ' . $montantFinal . ' FCFA, Solde actuel: ' . $user->solde . ' FCFA'
                ], 400);
            }

            // Créer la commande avec les montants calculés
            $commande = Commande::create([
                'id_utilisateur' => $userId,
                'type_livraison' => $request->type_livraison,
                'heure_arrivee' => $request->heure_arrivee,
                'adresse_livraison' => $request->adresse_livraison,
                'commentaire_client' => $request->commentaire_client,
                'montant_total' => $montantTotal,
                'montant_remise' => $montantRemise,
                'montant_final' => $montantFinal,
                'points_utilises' => $pointsUtilises,
            ]);

            // Créer les détails de la commande
            foreach ($request->articles as $article) {
                DetailCommande::create([
                    'id_commande' => $commande->id_commande,
                    'id_article' => $article['id'],
                    'prix_unitaire' => $article['prix'],
                    'quantite' => $article['quantite'],
                ]);

                // Décrémenter le stock automatiquement
                $stock = Stock::where('id_article', $article['id'])->first();
                if ($stock) {
                    $stock->quantite_disponible -= $article['quantite'];
                    $stock->date_mise_a_jour = now();
                    $stock->save();

                    // Mettre à jour la disponibilité de l'article si rupture de stock
                    if ($stock->quantite_disponible <= 0) {
                        $menu = Menu::find($article['id']);
                        if ($menu) {
                            $menu->disponible = false;
                            $menu->save();
                        }
                    }
                }
            }

            // Débiter le solde de l'utilisateur
            $user->solde -= $montantFinal;

            // Débiter les points utilisés
            if ($pointsUtilises > 0) {
                $user->point_fidelite -= $pointsUtilises;

                // Enregistrer l'utilisation des points
                SuiviPoint::create([
                    'id_utilisateur' => $userId,
                    'id_commande' => $commande->id_commande,
                    'variation_points' => -$pointsUtilises,
                    'solde_apres' => $user->point_fidelite,
                    'source_points' => 'utilisation_commande',
                ]);
            }

            // Calculer et ajouter les points gagnés (1000 FCFA = 1 point)
            $pointsGagnes = floor($montantFinal / 1000);
            if ($pointsGagnes > 0) {
                $user->point_fidelite += $pointsGagnes;

                // Enregistrer le gain de points
                SuiviPoint::create([
                    'id_utilisateur' => $userId,
                    'id_commande' => $commande->id_commande,
                    'variation_points' => $pointsGagnes,
                    'solde_apres' => $user->point_fidelite,
                    'source_points' => 'achat',
                    'date_expiration' => now()->addYear(), // Points valables 1 an
                ]);
            }

            $user->save();

            $commande->refresh();

            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => new CommandeResource($commande->load(['details.article', 'utilisateur']))
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage()
            ], 500);
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

    /**sp
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

    /**
     * Récupérer TOUTES les commandes (pour staff uniquement)
     */
    public function all()
    {
        try {
            $commandes = Commande::with(['details.article', 'utilisateur'])
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
     * Mettre à jour le statut d'une commande (pour staff uniquement)
     */
    public function updateStatus($id, Request $request)
    {
        try {
            $commande = Commande::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'statut' => 'required|in:en_attente,en_preparation,prete,livree,annulee'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $commande->statut_commande = $request->statut;
            $commande->save();

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'data' => new CommandeResource($commande->load('details'))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
