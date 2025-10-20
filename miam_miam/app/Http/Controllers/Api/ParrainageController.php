<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ParrainageController extends Controller
{
    public function monCode(): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        return response()->json([
            'code' => $user->code_parrainage,
        ]);
    }

    public function mesFilleuls()
    {
        $userId = Auth::id();
        if (! $userId) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $filleuls = User::where('id_parrain', $userId)
                        ->with('parrainages')
                        ->get();

        return UserResource::collection($filleuls);
    }
}
