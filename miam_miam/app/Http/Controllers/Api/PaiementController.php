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

class PaiementController extends Controller
{
    public function initier(InitierPaiementRequest $request)
    {
        $commande = Commande::findOrFail($request->commande_id);

        if ($commande->id_utilisateur !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $paiementService = app(PaiementService::class);
        $result = $paiementService->initierPaiement($commande, $request->methode_paiement);

        return response()->json($result);
    }

    public function notify(Request $request)
    {
        $transactionId = $request->cpm_trans_id;

        $paiement = Paiement::where('identifiant_transaction', $transactionId)->firstOrFail();

        if ($request->cpm_result == '00') {
            $paiement->update(['statut_paiement' => 'reussi']);
            $commande = $paiement->commande;
            $commande->update(['statut_commande' => 'validee']);
            app(FideliteService::class)->attribuerPoints($commande);
            app(CommandeService::class)->decrementerStock($commande);
        } else {
            $paiement->update(['statut_paiement' => 'echoue']);
        }

        return response()->json(['status' => 'ok']);
    }
}
