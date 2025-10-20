<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FideliteService;
use App\Http\Resources\SuiviPointResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FideliteController extends Controller
{
    public function solde(): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        return response()->json([
            'points' => $user->point_fidelite ?? 0,
            'valeur_fcfa' => floor(($user->point_fidelite ?? 0) / 15) * 1000,
        ]);
    }

    public function historique()
    {
        $userId = Auth::id();
        if (! $userId) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $historique = app(FideliteService::class)->historique($userId);

        return SuiviPointResource::collection($historique);
    }
}
