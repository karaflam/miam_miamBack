<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;


class FideliteController extends Controller
{
    public function solde(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            return response()->json([
                'points' => (int) ($user->point_fidelite ?? 0),
                'valeur_fcfa' => (int) (($user->point_fidelite ?? 0) / 15) * 1000,
                'message' => 'Solde récupéré avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du solde'
            ], 500);
        }
    }

    public function historique(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // TODO: Implement historique logic
            return response()->json([
                'historique' => [],
                'message' => 'Historique récupéré avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération de l\'historique'
            ], 500);
        }
    }
}
