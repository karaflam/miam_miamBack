<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StaffAuthController extends Controller
{
    /**
     * Handle staff login request
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Rechercher l'employé par email
        $employe = Employe::where('email', $request->email)
            ->where('actif', 'oui')
            ->with('role')
            ->first();

        // Vérifier si l'employé existe et si le mot de passe est correct
        if (!$employe || !Hash::check($request->password, $employe->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        // Créer un token pour l'authentification
        $token = $employe->createToken('staff-auth-token')->plainTextToken;

        // Déterminer le rôle basé sur le nom du rôle
        $roleName = strtolower($employe->role->nom_role ?? 'employee');
        $roleMapping = [
            'administrateur' => 'admin',
            'admin' => 'admin',
            'gerant' => 'manager',
            'manager' => 'manager',
            'gestionnaire' => 'manager',
            'employé' => 'employee',
            'employe' => 'employee',
        ];
        
        $mappedRole = $roleMapping[$roleName] ?? 'employee';

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $employe->id_employe,
                'name' => $employe->nom . ' ' . $employe->prenom,
                'email' => $employe->email,
                'role' => $mappedRole,
                'telephone' => $employe->telephone,
                'date_embauche' => $employe->date_embauche,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Handle staff logout request
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie',
        ]);
    }

    /**
     * Get authenticated staff member
     */
    public function user(Request $request)
    {
        $employe = $request->user();
        $employe->load('role');

        $roleName = strtolower($employe->role->nom_role ?? 'employee');
        $roleMapping = [
            'administrateur' => 'admin',
            'admin' => 'admin',
            'gerant' => 'manager',
            'manager' => 'manager',
            'gestionnaire' => 'manager',
            'employé' => 'employee',
            'employe' => 'employee',
        ];
        
        $mappedRole = $roleMapping[$roleName] ?? 'employee';

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $employe->id_employe,
                'name' => $employe->nom . ' ' . $employe->prenom,
                'email' => $employe->email,
                'role' => $mappedRole,
                'telephone' => $employe->telephone,
                'date_embauche' => $employe->date_embauche,
            ],
        ]);
    }
}
