<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DiagnosticController extends Controller
{
    /**
     * Diagnostic de l'authentification et des permissions
     */
    public function authDiagnostic(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun utilisateur authentifié',
                'diagnostic' => [
                    'authenticated' => false,
                    'token_present' => $request->bearerToken() ? 'Oui' : 'Non',
                ]
            ], 401);
        }

        $userClass = get_class($user);
        $diagnostic = [
            'authenticated' => true,
            'user_class' => $userClass,
            'user_id' => null,
            'user_email' => $user->email ?? 'N/A',
            'user_name' => null,
            'role_info' => null,
        ];

        // Informations spécifiques selon le type d'utilisateur
        if ($userClass === 'App\Models\Employe') {
            $user->load('role');
            $diagnostic['user_id'] = $user->id_employe;
            $diagnostic['user_name'] = $user->nom . ' ' . $user->prenom;
            $diagnostic['actif'] = $user->actif;
            $diagnostic['id_role'] = $user->id_role;
            
            if ($user->role) {
                $diagnostic['role_info'] = [
                    'id' => $user->role->id_role,
                    'nom_role' => $user->role->nom_role,
                    'nom_role_lowercase' => strtolower($user->role->nom_role),
                    'description' => $user->role->description ?? 'N/A',
                ];
            } else {
                $diagnostic['role_info'] = 'Aucun rôle associé';
            }
        } elseif ($userClass === 'App\Models\User') {
            $diagnostic['user_id'] = $user->id_utilisateur;
            $diagnostic['user_name'] = $user->nom . ' ' . $user->prenom;
            $diagnostic['statut'] = $user->statut;
            $diagnostic['role_info'] = [
                'role' => $user->role ?? 'student',
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Diagnostic de l\'authentification',
            'diagnostic' => $diagnostic,
        ]);
    }
}
