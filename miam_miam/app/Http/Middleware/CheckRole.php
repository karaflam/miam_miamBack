<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
        $userClass = get_class($user);

        // Vérifier si c'est un employé (modèle Employe)
        if ($userClass === 'App\Models\Employe') {
            // Charger la relation role si elle n'est pas déjà chargée
            if (!$user->relationLoaded('role')) {
                $user->load('role');
            }

            // Si l'utilisateur a un rôle
            if ($user->role) {
                $nomRole = strtolower($user->role->nom_role);
                
                // Vérifier si le rôle de l'employé correspond à un des rôles autorisés
                foreach ($roles as $role) {
                    $roleAutorise = strtolower($role);
                    
                    // Correspondances possibles pour chaque rôle
                    $roleMatches = [
                        'admin' => ['admin', 'administrateur', 'administrator'],
                        'employe' => ['employe', 'employé', 'employee', 'staff', 'gerant', 'gestionnaire', 'manager'],
                        'manager' => ['gerant', 'gestionnaire', 'manager'],
                        'student' => ['student', 'etudiant', 'utilisateur'],
                    ];
                    
                    // Vérifier si le rôle correspond directement
                    if ($nomRole === $roleAutorise) {
                        return $next($request);
                    }
                    
                    // Vérifier les correspondances
                    if (isset($roleMatches[$roleAutorise]) && in_array($nomRole, $roleMatches[$roleAutorise])) {
                        return $next($request);
                    }
                }
            }
        } 
        // Vérifier si c'est un utilisateur normal (modèle User)
        elseif ($userClass === 'App\Models\User') {
            // Les utilisateurs normaux ne peuvent accéder qu'aux routes autorisées pour 'student'
            $userRole = strtolower($user->role ?? 'student');
            
            foreach ($roles as $role) {
                $roleAutorise = strtolower($role);
                
                // Vérifier si le rôle de l'utilisateur correspond
                if ($userRole === $roleAutorise || 
                    ($roleAutorise === 'student' && in_array($userRole, ['student', 'etudiant', 'utilisateur']))) {
                    return $next($request);
                }
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Accès non autorisé. Permissions insuffisantes.'
        ], 403);
    }
}
