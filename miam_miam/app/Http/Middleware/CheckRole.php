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
                Log::info('CheckRole - Vérification:', [
                    'nom_role' => $nomRole, 
                    'nom_role_original' => $user->role->nom_role,
                    'roles_autorises' => $roles,
                    'user_email' => $user->email
                ]);
                
                // Correspondances directes et alias (définies une seule fois)
                $correspondances = [
                    'admin' => ['admin', 'administrateur'],
                    'employe' => ['employe', 'employee'],
                    'manager' => ['manager', 'gerant'],
                    'student' => ['student', 'etudiant']
                ];
                
                // Vérifier si le rôle de l'employé correspond à un des rôles autorisés
                foreach ($roles as $role) {
                    $roleAutorise = strtolower(trim($role));
                    
                    // 1. Vérification directe
                    if ($nomRole === $roleAutorise) {
                        Log::info('CheckRole - Accès autorisé (correspondance directe)');
                        return $next($request);
                    }
                    
                    // 2. Vérification via correspondances du rôle autorisé
                    if (isset($correspondances[$roleAutorise]) && in_array($nomRole, $correspondances[$roleAutorise])) {
                        Log::info('CheckRole - Accès autorisé (via correspondances)', ['roleAutorise' => $roleAutorise]);
                        return $next($request);
                    }
                    
                    // 3. Vérification inverse : le nom du rôle correspond-il à une clé et le rôle autorisé est dans ses alias ?
                    if (isset($correspondances[$nomRole]) && in_array($roleAutorise, $correspondances[$nomRole])) {
                        Log::info('CheckRole - Accès autorisé (correspondance inverse)');
                        return $next($request);
                    }
                }
                
                Log::warning('CheckRole - Accès refusé', [
                    'nom_role' => $nomRole,
                    'roles_autorises' => $roles
                ]);
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
