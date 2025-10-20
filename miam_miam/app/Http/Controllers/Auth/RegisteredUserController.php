<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'localisation' => 'required|string|max:255',
            'code_parrain' => 'nullable|string|exists:users,code_parrainage',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'code_parrain.exists' => 'Ce code de parrainage n\'existe pas.',
        ]);

        // Rechercher le parrain par son code de parrainage
        $idParrain = null;
        if ($request->filled('code_parrain')) {
            $parrain = User::where('code_parrainage', $request->code_parrain)->first();
            if ($parrain) {
                $idParrain = $parrain->id_utilisateur; // Utilisez le nom exact de votre colonne ID
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
            'code_parrainage' => Str::random(8), // Génère un code pour ce nouvel utilisateur
        ]);

        // Actions supplémentaires si un parrain existe
        if ($idParrain) {
            // Optionnel : Ajouter des points au parrain
            $parrain = User::find($idParrain);
            if ($parrain) {
                $parrain->increment('point_fidelite', 10); // Donne 10 points au parrain
                
                // Vous pouvez aussi envoyer une notification
                // $parrain->notify(new NewFilleulNotification($user));
            }
        }

        

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
