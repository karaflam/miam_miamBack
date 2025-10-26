<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DebugController extends Controller
{
    /**
     * Afficher les informations de l'utilisateur connecté
     */
    public function whoami(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        $data = [
            'success' => true,
            'user_type' => get_class($user),
            'user_data' => [
                'id' => $user->id_employe ?? $user->id ?? null,
                'nom' => $user->nom ?? null,
                'prenom' => $user->prenom ?? null,
                'email' => $user->email ?? null,
            ]
        ];

        // Si c'est un employé, charger le rôle
        if (get_class($user) === 'App\Models\Employe') {
            if (!$user->relationLoaded('role')) {
                $user->load('role');
            }
            
            if ($user->role) {
                $data['role'] = [
                    'id_role' => $user->role->id_role,
                    'nom_role' => $user->role->nom_role,
                    'nom_role_lowercase' => strtolower(trim($user->role->nom_role)),
                    'description' => $user->role->description ?? null
                ];
            } else {
                $data['role'] = null;
                $data['warning'] = 'Utilisateur sans rôle assigné';
            }
        }

        return response()->json($data);
    }
}
