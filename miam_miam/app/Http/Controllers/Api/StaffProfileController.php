<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

class StaffProfileController extends Controller
{
    /**
     * Get staff profile
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        // Debug: Log l'utilisateur récupéré
        Log::info('StaffProfileController::show - User récupéré:', [
            'class' => get_class($user),
            'id_employe' => $user->id_employe ?? 'N/A',
            'id_utilisateur' => $user->id_utilisateur ?? 'N/A',
            'nom' => $user->nom ?? 'N/A',
            'prenom' => $user->prenom ?? 'N/A',
            'email' => $user->email ?? 'N/A',
            'all_attributes' => $user->getAttributes(),
        ]);
        
        // Vérifier que c'est bien un Employe
        if (!($user instanceof \App\Models\Employe)) {
            Log::error('StaffProfileController::show - ERREUR: User n\'est pas un Employe!', [
                'class' => get_class($user),
                'expected' => \App\Models\Employe::class,
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Utilisateur non autorisé. Veuillez vous reconnecter.',
            ], 401);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id_employe,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'date_embauche' => $user->date_embauche,
            ],
        ]);
    }

    /**
     * Update staff profile
     */
    public function update(Request $request)
    {
        $employe = $request->user();

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:employes,email,' . $employe->id_employe . ',id_employe',
            'telephone' => 'nullable|string|max:15|unique:employes,telephone,' . $employe->id_employe . ',id_employe',
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'L\'email doit être une adresse valide.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
        ]);

        $employe->update([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'] ?? $employe->telephone,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès.',
            'data' => [
                'id' => $employe->id_employe,
                'nom' => $employe->nom,
                'prenom' => $employe->prenom,
                'email' => $employe->email,
                'telephone' => $employe->telephone,
                'date_embauche' => $employe->date_embauche,
            ],
        ]);
    }

    /**
     * Update staff password
     */
    public function updatePassword(Request $request)
    {
        $employe = $request->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'current_password.required' => 'Le mot de passe actuel est obligatoire.',
            'password.required' => 'Le nouveau mot de passe est obligatoire.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ]);

        // Vérifier que le mot de passe actuel est correct
        if (!Hash::check($validated['current_password'], $employe->mot_de_passe)) {
            return response()->json([
                'success' => false,
                'error' => 'Le mot de passe actuel est incorrect.',
                'errors' => [
                    'current_password' => ['Le mot de passe actuel est incorrect.']
                ]
            ], 422);
        }

        // Mettre à jour le mot de passe
        $employe->update([
            'mot_de_passe' => Hash::make($validated['password'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès.',
        ]);
    }
}
