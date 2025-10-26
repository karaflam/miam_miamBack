<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\InitierPaiementRequest;
use App\Models\Commande;
use App\Models\Paiement;
use App\Services\PaiementService;
use App\Services\FideliteService;
use App\Services\CommandeService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaiementController extends Controller
{
    public function initier(InitierPaiementRequest $request)
    {
        try {
            $commande = Commande::with('utilisateur')->findOrFail($request->commande_id);

            // Vérifier que c'est bien la commande de l'utilisateur
            if ($commande->id_utilisateur !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Non autorisé'
                ], 403);
            }

            // Vérifier que la commande n'est pas déjà payée
            if ($commande->statut_commande === 'validee') {
                return response()->json([
                    'success' => false,
                    'error' => 'Cette commande est déjà payée'
                ], 400);
            }

            $paiementService = app(PaiementService::class);
            
            // Paiement avec points
            if ($request->methode_paiement === 'points') {
                $result = $paiementService->payerAvecPoints(
                    $commande, 
                    $request->points_utilises ?? 0
                );
                
                if ($result['success']) {
                    $commande->update(['statut_commande' => 'validee']);
                    app(FideliteService::class)->attribuerPoints($commande);
                    app(CommandeService::class)->decrementerStock($commande);
                }
                
                return response()->json($result);
            }
            
            // Paiement CinetPay
            $result = $paiementService->initierPaiement($commande, $request->methode_paiement);
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            Log::error('Erreur initiation paiement: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function notify(Request $request)
    {
        Log::info('CinetPay Webhook reçu:', $request->all());

        try {
            $transactionId = $request->cpm_trans_id;

            if (!$transactionId) {
                return response()->json(['status' => 'error', 'message' => 'Transaction ID manquant'], 400);
            }

            $paiement = Paiement::where('identifiant_transaction', $transactionId)->first();

            if (!$paiement) {
                Log::warning("Paiement introuvable pour transaction: {$transactionId}");
                return response()->json(['status' => 'error', 'message' => 'Paiement non trouvé'], 404);
            }

            // Vérifier le statut auprès de CinetPay
            $paiementService = app(PaiementService::class);
            $statusCheck = $paiementService->verifierPaiement($transactionId);

            if ($statusCheck['success'] && $statusCheck['status'] === 'ACCEPTED') {
                $paiement->update(['statut_paiement' => 'reussi']);
                
                $commande = $paiement->commande;
                $commande->update(['statut_commande' => 'validee']);
                
                // Attribuer points et décrémenter stock
                app(FideliteService::class)->attribuerPoints($commande);
                app(CommandeService::class)->decrementerStock($commande);
                
                Log::info("Paiement réussi pour commande #{$commande->id_commande}");
            } else {
                $paiement->update(['statut_paiement' => 'echoue']);
                Log::warning("Paiement échoué pour transaction: {$transactionId}");
            }

            return response()->json(['status' => 'ok']);
            
        } catch (\Exception $e) {
            Log::error('Erreur webhook CinetPay: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function verifier($transactionId)
    {
        try {
            $paiementService = app(PaiementService::class);
            $result = $paiementService->verifierPaiement($transactionId);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function recharger(Request $request)
    {
        $request->validate([
            'montant' => 'required|numeric|min:100|max:1000000',
        ]);

        try {
            $user = Auth::user();
            $montant = $request->montant;

            // Incrémenter le solde
            $user->solde += $montant;
            $user->save();

            Log::info("Recharge de {$montant} FCFA pour l'utilisateur {$user->id_utilisateur}");

            return response()->json([
                'success' => true,
                'message' => 'Recharge effectuée avec succès',
                'data' => [
                    'nouveau_solde' => $user->solde,
                    'montant_recharge' => $montant,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur recharge: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la recharge'
            ], 500);
        }
    }
}