<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Vérifier si l'utilisateur est authentifié
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        $user = $request->user();

        // Vérifier si c'est un employé (modèle Employe)
        if (get_class($user) === 'App\Models\Employe') {
            // Charger la relation role si elle n'est pas déjà chargée
            if (!$user->relationLoaded('role')) {
                $user->load('role');
            }

            // Si l'utilisateur a un rôle
            if ($user->role) {
                $nomRole = strtolower(trim($user->role->nom_role));
                
                // Log pour déboguer (à retirer en production)
                Log::info('CheckRole - Nom du rôle:', ['nom_role' => $nomRole, 'roles_autorises' => $roles]);
                
                // Vérifier si le rôle de l'employé correspond à un des rôles autorisés
                foreach ($roles as $role) {
                    $roleAutorise = strtolower(trim($role));
                    
                    // Correspondances directes et alias
                    $correspondances = [
                        'admin' => ['admin', 'administrateur', 'administrator'],
                        'employe' => ['employe', 'employé', 'employee', 'staff', 'gerant', 'gérant', 'manager'],
                        'manager' => ['manager', 'gerant', 'gérant', 'gestionnaire'],
                        'student' => ['student', 'etudiant', 'étudiant']
                    ];
                    
                    // Vérification directe
                    if ($nomRole === $roleAutorise) {
                        return $next($request);
                    }
                    
                    // Vérification via correspondances
                    if (isset($correspondances[$roleAutorise]) && in_array($nomRole, $correspondances[$roleAutorise])) {
                        return $next($request);
                    }
                    
                    // Vérification inverse (si le nom du rôle est dans les correspondances du rôle autorisé)
                    foreach ($correspondances as $key => $aliases) {
                        if ($roleAutorise === $key && in_array($nomRole, $aliases)) {
                            return $next($request);
                        }
                    }
                }
            } else {
                Log::warning('CheckRole - Utilisateur sans rôle:', ['user_id' => $user->id_employe]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Accès non autorisé. Permissions insuffisantes.',
            'debug' => [
                'user_type' => get_class($user),
                'role' => $user->role->nom_role ?? 'no_role',
                'required_roles' => $roles
            ]
        ], 403);
    }
}
