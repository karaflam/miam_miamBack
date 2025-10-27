<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FideliteService;
use App\Http\Resources\SuiviPointResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

    /**
     * Ajouter des points de fidélité depuis les jeux (Blackjack, Quiz)
     */
    public function addPoints(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $validated = $request->validate([
            'points' => 'required|integer|min:0|max:10',
            'source' => 'required|string|in:blackjack,quiz',
            'score' => 'nullable|integer'
        ]);

        // Ajouter les points au compte de l'utilisateur
        $pointsAvant = $user->point_fidelite ?? 0;
        $user->point_fidelite = $pointsAvant + $validated['points'];
        $user->save();

        // Logger l'activité pour traçabilité
        Log::info('Points de jeu ajoutés', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'points_ajoutes' => $validated['points'],
            'source' => $validated['source'],
            'score' => $validated['score'] ?? null,
            'points_avant' => $pointsAvant,
            'points_apres' => $user->point_fidelite
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Points ajoutés avec succès',
            'points_ajoutes' => $validated['points'],
            'total_points' => $user->point_fidelite,
            'source' => $validated['source']
        ]);
    }
}
