<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class ReferralController extends Controller
{
    /**
     * Get user referral code and stats
     */
    public function getCode(Request $request)
    {
        $user = $request->user();
        
        // Compter le nombre de filleuls
        $referralsCount = User::where('id_parrain', $user->id_utilisateur)->count();
        
        return response()->json([
            'success' => true,
            'data' => [
                'code' => $user->code_parrainage,
                'referrals_count' => $referralsCount,
                'points_earned' => $referralsCount * 10, // 10 points par filleul
            ],
        ]);
    }

    /**
     * Get user referrals list
     */
    public function getReferrals(Request $request)
    {
        $user = $request->user();
        
        // Récupérer tous les filleuls
        $referrals = User::where('id_parrain', $user->id_utilisateur)
            ->select('id_utilisateur', 'nom', 'prenom', 'email', 'date_creation')
            ->orderBy('date_creation', 'desc')
            ->get()
            ->map(function ($referral) {
                return [
                    'id' => $referral->id_utilisateur,
                    'name' => $referral->prenom . ' ' . $referral->nom,
                    'email' => $referral->email,
                    'date' => $referral->date_creation,
                    'points_awarded' => 10,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $referrals,
        ]);
    }
}
