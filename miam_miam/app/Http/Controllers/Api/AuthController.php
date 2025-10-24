<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        $user = Auth::user();
        
        // Créer un token pour l'authentification
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id_utilisateur,
                'name' => $user->nom . ' ' . $user->prenom,
                'email' => $user->email,
                'role' => $user->role ?? 'student',
                'balance' => $user->solde ?? 0,
                'loyaltyPoints' => $user->point_fidelite ?? 0,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Handle registration request
     */
    public function register(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'localisation' => 'required|string|max:255',
            'code_parrain' => 'nullable|string|exists:users,code_parrainage',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'code_parrain.exists' => 'Ce code de parrainage n\'existe pas.',
        ]);

        // Rechercher le parrain par son code de parrainage
        $idParrain = null;
        if ($request->filled('code_parrain')) {
            $parrain = User::where('code_parrainage', $request->code_parrain)->first();
            if ($parrain) {
                $idParrain = $parrain->id_utilisateur;
            }
        }

        // Créer l'utilisateur
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'telephone' => $request->telephone,
            'localisation' => $request->localisation,
            'email' => $request->email,
            'mot_de_passe' => Hash::make($request->password),
            'id_parrain' => $idParrain,
            'code_parrainage' => Str::random(8),
            'role' => 'student', // Par défaut, les inscriptions sont pour les étudiants
        ]);

        // Actions supplémentaires si un parrain existe
        if ($idParrain) {
            $parrain = User::find($idParrain);
            if ($parrain) {
                $parrain->increment('point_fidelite', 10);
            }
        }

        event(new Registered($user));

        // Connecter automatiquement l'utilisateur
        Auth::login($user);

        // Créer un token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id_utilisateur,
                'name' => $user->nom . ' ' . $user->prenom,
                'email' => $user->email,
                'role' => $user->role ?? 'student',
                'balance' => $user->solde ?? 0,
                'loyaltyPoints' => $user->point_fidelite ?? 0,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Handle logout request
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
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id_utilisateur,
                'name' => $user->nom . ' ' . $user->prenom,
                'email' => $user->email,
                'role' => $user->role ?? 'student',
                'balance' => $user->solde ?? 0,
                'loyaltyPoints' => $user->point_fidelite ?? 0,
            ],
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Logique d'envoi d'email de réinitialisation
        // À implémenter selon vos besoins

        return response()->json([
            'success' => true,
            'message' => 'Un lien de réinitialisation a été envoyé à votre adresse email.',
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Logique de réinitialisation du mot de passe
        // À implémenter selon vos besoins

        return response()->json([
            'success' => true,
            'message' => 'Votre mot de passe a été réinitialisé avec succès.',
        ]);
    }
}
