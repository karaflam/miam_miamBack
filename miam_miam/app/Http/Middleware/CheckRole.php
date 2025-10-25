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

        // Vérifier si c'est un employé (modèle Employe)
        if (get_class($user) === 'App\Models\Employe') {
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
                    
                    // Correspondances possibles
                    if ($nomRole === $roleAutorise || 
                        ($roleAutorise === 'admin' && $nomRole === 'administrateur') ||
                        ($roleAutorise === 'employe' && in_array($nomRole, ['employe', 'employé', 'staff']))) {
                        return $next($request);
                    }
                }
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Accès non autorisé. Permissions insuffisantes.'
        ], 403);
    }
}
