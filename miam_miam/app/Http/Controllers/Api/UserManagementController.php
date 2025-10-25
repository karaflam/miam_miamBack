<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserManagementController extends Controller
{
    /**
     * Liste tous les utilisateurs avec pagination et filtres
     */
    public function index(Request $request)
    {
        // Récupérer les utilisateurs (étudiants)
        $users = User::query()
            ->select([
                DB::raw("CONCAT('user_', id_utilisateur) as id"),
                'id_utilisateur as original_id',
                'nom',
                'prenom',
                'email',
                'telephone',
                'localisation',
                'code_parrainage',
                'id_parrain',
                'point_fidelite',
                'statut',
                'date_creation',
                DB::raw("'student' as role"),
                DB::raw("'user' as type")
            ]);

        // Récupérer les employés
        $employes = \App\Models\Employe::query()
            ->select([
                DB::raw("CONCAT('employe_', id_employe) as id"),
                DB::raw("id_employe as original_id"),
                'nom',
                'prenom',
                'email',
                'telephone',
                DB::raw("NULL::text as localisation"),
                DB::raw("NULL::text as code_parrainage"),
                DB::raw("NULL::integer as id_parrain"),
                DB::raw("0 as point_fidelite"),
                DB::raw("CASE WHEN actif = 'oui' THEN 'actif' ELSE 'inactif' END as statut"),
                'date_creation',
                DB::raw("CASE 
                    WHEN id_role = 1 THEN 'student'
                    WHEN id_role = 2 THEN 'employee'
                    WHEN id_role = 3 THEN 'manager'
                    WHEN id_role = 4 THEN 'admin'
                    ELSE 'employee'
                END as role"),
                DB::raw("'employe' as type")
            ]);

        // Combiner les deux requêtes
        $allUsers = $users->union($employes);

        // Recherche par nom, prénom ou email
        if ($request->has('search')) {
            $search = $request->search;
            $allUsers = DB::table(DB::raw("({$allUsers->toSql()}) as combined_users"))
                ->mergeBindings($allUsers->getQuery())
                ->where(function($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('telephone', 'like', "%{$search}%");
                });
        } else {
            $allUsers = DB::table(DB::raw("({$allUsers->toSql()}) as combined_users"))
                ->mergeBindings($allUsers->getQuery());
        }

        // Filtre par rôle
        if ($request->has('role') && $request->role !== 'all') {
            $allUsers->where('role', $request->role);
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $allUsers->where('statut', $request->statut);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'date_creation');
        $sortOrder = $request->get('sort_order', 'desc');
        $allUsers->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $results = $allUsers->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
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
     * Crée un nouvel utilisateur (étudiant ou employé)
     */
    public function store(Request $request)
    {
        $type = $request->input('type', 'user'); // 'user' ou 'employe'
        
        if ($type === 'employe') {
            return $this->createEmploye($request);
        }
        
        return $this->createUser($request);
    }
    
    /**
     * Crée un nouvel utilisateur étudiant
     */
    private function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|unique:employes,email',
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
            'data' => $user
        ], 201);
    }
    
    /**
     * Crée un nouvel employé
     */
    private function createEmploye(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:employes,email|unique:users,email',
            'telephone' => 'required|string|max:20',
            'mot_de_passe' => 'required|string|min:8',
            'id_role' => 'required|exists:roles,id_role',
            'date_embauche' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $currentUser = auth()->user();
        $idCreateur = null;
        
        // Déterminer l'ID du créateur selon le type d'utilisateur connecté
        if ($currentUser && get_class($currentUser) === 'App\Models\Employe') {
            $idCreateur = $currentUser->id_employe;
        }
        
        $employe = \App\Models\Employe::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'id_role' => $request->id_role,
            'date_embauche' => $request->date_embauche ?? now(),
            'actif' => 'oui',
            'id_createur' => $idCreateur,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employé créé avec succès',
            'data' => $employe
        ], 201);
    }

    /**
     * Met à jour un utilisateur existant (étudiant ou employé)
     */
    public function update(Request $request, $id)
    {
        $type = $request->input('type', 'user');
        
        // Extraire l'ID réel à partir de l'ID préfixé
        $realId = $this->extractRealId($id, $type);
        
        if ($type === 'employe') {
            return $this->updateEmploye($request, $realId);
        }
        
        return $this->updateUser($request, $realId);
    }
    
    /**
     * Extrait l'ID réel à partir de l'ID préfixé
     */
    private function extractRealId($id, $type)
    {
        // Si l'ID contient un préfixe, l'extraire
        if (strpos($id, 'user_') === 0) {
            return (int) str_replace('user_', '', $id);
        }
        if (strpos($id, 'employe_') === 0) {
            return (int) str_replace('employe_', '', $id);
        }
        
        // Sinon, retourner l'ID tel quel
        return (int) $id;
    }
    
    /**
     * Met à jour un utilisateur étudiant
     */
    private function updateUser(Request $request, $id)
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
            'email' => 'sometimes|email|unique:users,email,' . $id . ',id_utilisateur|unique:employes,email',
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
            'data' => $user->fresh()
        ]);
    }
    
    /**
     * Met à jour un employé
     */
    private function updateEmploye(Request $request, $id)
    {
        $employe = \App\Models\Employe::find($id);

        if (!$employe) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:employes,email,' . $id . ',id_employe|unique:users,email',
            'telephone' => 'sometimes|string|max:20',
            'id_role' => 'sometimes|exists:roles,id_role',
            'actif' => 'sometimes|in:oui,non',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $employe->update($request->only([
            'nom', 'prenom', 'email', 'telephone', 'id_role', 'actif'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Employé mis à jour avec succès',
            'data' => $employe->fresh()
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
     * Supprime définitivement un utilisateur (étudiant ou employé)
     */
    public function destroy(Request $request, $id)
    {
        $type = $request->input('type', 'user');
        
        // Extraire l'ID réel à partir de l'ID préfixé
        $realId = $this->extractRealId($id, $type);
        
        if ($type === 'employe') {
            $employe = \App\Models\Employe::find($realId);
            
            if (!$employe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employé non trouvé'
                ], 404);
            }
            
            // Supprimer définitivement l'employé
            $employe->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Employé supprimé définitivement avec succès'
            ]);
        }
        
        $user = User::find($realId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Supprimer définitivement l'utilisateur
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé définitivement avec succès'
        ]);
    }
    
    /**
     * Active ou désactive un utilisateur (suspend/réactive)
     */
    public function toggleStatus(Request $request, $id)
    {
        $type = $request->input('type', 'user');
        
        // Extraire l'ID réel à partir de l'ID préfixé
        $realId = $this->extractRealId($id, $type);
        
        if ($type === 'employe') {
            $employe = \App\Models\Employe::find($realId);
            
            if (!$employe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employé non trouvé'
                ], 404);
            }
            
            // Basculer le statut actif/inactif
            $newStatus = $employe->actif === 'oui' ? 'non' : 'oui';
            $employe->update(['actif' => $newStatus]);
            
            return response()->json([
                'success' => true,
                'message' => $newStatus === 'oui' ? 'Employé activé avec succès' : 'Employé suspendu avec succès',
                'data' => $employe->fresh()
            ]);
        }
        
        $user = User::find($realId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Basculer le statut actif/inactif
        $newStatus = $user->statut === 'actif' ? 'inactif' : 'actif';
        $user->update(['statut' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'actif' ? 'Utilisateur activé avec succès' : 'Utilisateur suspendu avec succès',
            'data' => $user->fresh()
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
