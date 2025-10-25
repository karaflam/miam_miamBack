<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserManagementController extends Controller
{
    /**
     * Liste tous les utilisateurs avec pagination et filtres
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Recherche par nom, prénom ou email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%");
            });
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'date_creation');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->with(['commandes', 'paiements', 'filleuls'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    /**
     * Affiche les détails d'un utilisateur spécifique
     */
    public function show($id)
    {
        $user = User::with([
            'commandes.paiement',
            'paiements',
            'filleuls',
            'parrain',
            'reclamations',
            'suiviPoints',
            'activites'
        ])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Crée un nouvel utilisateur
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|max:20',
            'mot_de_passe' => 'required|string|min:8',
            'localisation' => 'nullable|string',
            'id_parrain' => 'nullable|exists:users,id_utilisateur',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Génération du code de parrainage unique
        $codeParrainage = strtoupper(Str::random(8));
        while (User::where('code_parrainage', $codeParrainage)->exists()) {
            $codeParrainage = strtoupper(Str::random(8));
        }

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'localisation' => $request->localisation,
            'code_parrainage' => $codeParrainage,
            'id_parrain' => $request->id_parrain,
            'point_fidelite' => 0,
            'statut' => 'actif'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * Met à jour un utilisateur existant
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id . ',id_utilisateur',
            'telephone' => 'sometimes|string|max:20',
            'localisation' => 'nullable|string',
            'point_fidelite' => 'sometimes|integer|min:0',
            'statut' => 'sometimes|in:actif,inactif,suspendu',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'nom', 'prenom', 'email', 'telephone', 
            'localisation', 'point_fidelite', 'statut'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur
     */
    public function resetPassword(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'mot_de_passe' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update([
            'mot_de_passe' => Hash::make($request->mot_de_passe)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès'
        ]);
    }

    /**
     * Supprime (désactive) un utilisateur
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Plutôt que de supprimer, on désactive l'utilisateur
        $user->update(['statut' => 'inactif']);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur désactivé avec succès'
        ]);
    }

    /**
     * Active un utilisateur
     */
    public function activate($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->update(['statut' => 'actif']);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur activé avec succès',
            'data' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Suspend un utilisateur
     */
    public function suspend($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->update(['statut' => 'suspendu']);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur suspendu avec succès',
            'data' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Obtient les statistiques des utilisateurs
     */
    public function statistics()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('statut', 'actif')->count();
        $inactiveUsers = User::where('statut', 'inactif')->count();
        $suspendedUsers = User::where('statut', 'suspendu')->count();
        $newUsersThisMonth = User::whereMonth('date_creation', now()->month)
                                  ->whereYear('date_creation', now()->year)
                                  ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalUsers,
                'actif' => $activeUsers,
                'inactif' => $inactiveUsers,
                'suspendu' => $suspendedUsers,
                'nouveaux_ce_mois' => $newUsersThisMonth,
            ]
        ]);
    }

    /**
     * Ajuste les points de fidélité d'un utilisateur
     */
    public function adjustPoints(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'points' => 'required|integer',
            'type' => 'required|in:ajouter,retirer',
            'raison' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $pointsActuels = $user->point_fidelite ?? 0;
        
        if ($request->type === 'ajouter') {
            $nouveauxPoints = $pointsActuels + $request->points;
        } else {
            $nouveauxPoints = max(0, $pointsActuels - $request->points);
        }

        $user->update(['point_fidelite' => $nouveauxPoints]);

        // Enregistrer dans l'historique des points si le modèle existe
        if (class_exists(\App\Models\SuiviPoint::class)) {
            \App\Models\SuiviPoint::create([
                'id_utilisateur' => $user->id_utilisateur,
                'points' => $request->type === 'ajouter' ? $request->points : -$request->points,
                'type_operation' => 'ajustement_admin',
                'description' => $request->raison,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Points ajustés avec succès',
            'data' => [
                'points_avant' => $pointsActuels,
                'points_apres' => $nouveauxPoints,
                'difference' => $nouveauxPoints - $pointsActuels,
            ]
        ]);
    }
}
