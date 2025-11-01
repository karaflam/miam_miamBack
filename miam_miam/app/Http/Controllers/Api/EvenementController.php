<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Http\Resources\EvenementResource;
use App\Http\Requests\StoreEvenementRequest;
use App\Http\Requests\UpdateEvenementRequest;
use Illuminate\Support\Facades\Storage;
use App\Models\Employe;

class EvenementController extends Controller
{
    /**
     * Liste des événements
     * Pour les étudiants : uniquement les événements actifs
     * Pour les admins : tous les événements
     */
    public function index()
    {
        $query = Evenement::query();
        
        // Les étudiants ne voient que les événements actifs
        // Les admins/managers voient tous les événements
        if (!$this->isAdminOrManager()) {
            $query->actif();
        }
        
        $evenements = $query->orderBy('date_debut', 'desc')->get();
        return EvenementResource::collection($evenements);
    }

    /**
     * Détails d'un événement
     * Les étudiants ne peuvent voir que les événements actifs
     */
    public function show($id)
    {
        $item = Evenement::findOrFail($id);
        
        // Vérifier que l'événement est actif pour les étudiants
        if (!$this->isAdminOrManager()) {
            if ($item->active !== 'oui' || 
                $item->date_debut > now() || 
                $item->date_fin < now()) {
                return response()->json([
                    'message' => 'Cet événement n\'est pas disponible'
                ], 403);
            }
        }
        
        return new EvenementResource($item);
    }
    
    /**
     * Participation à un événement (jeu ou événement)
     */
    public function participer($id)
    {
        $evenement = Evenement::findOrFail($id);
        
        // Vérifier que l'événement est actif
        if ($evenement->active !== 'oui' || 
            $evenement->date_debut > now() || 
            $evenement->date_fin < now()) {
            return response()->json([
                'success' => false,
                'message' => 'Cet événement n\'est pas disponible'
            ], 403);
        }
        
        // Vérifier la limite d'utilisation si applicable
        if ($evenement->limite_utilisation > 0 && 
            $evenement->nombre_utilisation >= $evenement->limite_utilisation) {
            return response()->json([
                'success' => false,
                'message' => 'La limite d\'utilisation de cet événement est atteinte'
            ], 403);
        }
        
        // TODO: Implémenter la logique spécifique selon le type d'événement
        // Pour les jeux : gérer les points, récompenses, etc.
        // Pour les promotions : enregistrer l'utilisation via UsagePromo
        
        return response()->json([
            'success' => true,
            'message' => 'Participation enregistrée',
            'data' => new EvenementResource($evenement)
        ]);
    }
    
    /**
     * Vérifie si l'utilisateur connecté est admin ou manager
     */
    private function isAdminOrManager(): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }
        
        // Si c'est un employé, vérifier son rôle
        if ($user instanceof Employe) {
            $user->load('role');
            if ($user->role) {
                $nomRole = strtolower($user->role->nom_role);
                return in_array($nomRole, ['admin', 'administrateur', 'manager', 'gerant']);
            }
        }
        
        // Sinon, c'est un étudiant (User)
        return false;
    }

    public function store(StoreEvenementRequest $request)
    {
        $data = $request->validated();
        
        // Par défaut, les événements créés par l'admin ne sont pas actifs
        // L'admin doit les activer manuellement avec toggle
        if (!isset($data['active'])) {
            $data['active'] = 'non';
        }
        
        // Gestion de l'upload d'affiche
        if ($request->hasFile('affiche')) {
            $path = $request->file('affiche')->store('evenements', 'public');
            $data['url_affiche'] = Storage::url($path);
        }
        
        $item = Evenement::create($data);
        return new EvenementResource($item);
    }

    public function update(UpdateEvenementRequest $request, $id)
    {
        $item = Evenement::findOrFail($id);
        
        // Protéger les jeux intégrés contre la modification complète
        if ($item->is_integrated) {
            // Seuls certains champs peuvent être modifiés pour les jeux intégrés
            $allowedFields = ['limite_utilisation', 'valeur_remise', 'description'];
            $data = array_intersect_key(
                $request->validated(),
                array_flip($allowedFields)
            );
        } else {
            $data = $request->validated();
            if ($request->hasFile('affiche')) {
                $path = $request->file('affiche')->store('evenements', 'public');
                $data['url_affiche'] = Storage::url($path);
            }
        }
        
        $item->update($data);
        return new EvenementResource($item);
    }

    public function destroy($id)
    {
        $item = Evenement::findOrFail($id);
        
        // Protéger les jeux intégrés contre la suppression
        if ($item->is_integrated) {
            return response()->json([
                'success' => false,
                'message' => 'Les jeux intégrés (Blackjack, Quiz) ne peuvent pas être supprimés. Vous pouvez uniquement les activer/désactiver.'
            ], 403);
        }
        
        $item->delete();
        return response()->json(['deleted' => true]);
    }

    public function toggle($id)
    {
        $item = Evenement::findOrFail($id);
        $item->active = $item->active === 'oui' ? 'non' : 'oui';
        $item->save();
        return new EvenementResource($item);
    }
}

