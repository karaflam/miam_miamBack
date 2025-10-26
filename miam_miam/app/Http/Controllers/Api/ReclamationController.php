<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Reclamation;

class ReclamationController extends Controller
{
    /**
     * Créer une nouvelle réclamation (utilisateur)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_commande' => 'nullable|exists:commandes,id_commande',
            'sujet' => 'required|string|max:150',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reclamation = Reclamation::create([
                'id_utilisateur' => Auth::id(),
                'id_commande' => $request->id_commande,
                'sujet' => $request->sujet,
                'description' => $request->description,
                'statut' => 'ouvert',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Réclamation créée avec succès',
                'data' => $reclamation->load('commande', 'utilisateur')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la création de la réclamation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les réclamations de l'utilisateur connecté
     */
    public function index()
    {
        try {
            $reclamations = Reclamation::where('id_utilisateur', Auth::id())
                ->with(['commande', 'utilisateur', 'employeAssigne'])
                ->orderBy('date_ouverture', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reclamations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réclamations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer toutes les réclamations (staff uniquement)
     */
    public function getAllReclamations(Request $request)
    {
        try {
            $query = Reclamation::with(['commande', 'utilisateur', 'employeAssigne']);

            // Filtrer par statut
            if ($request->has('statut') && $request->statut !== 'all') {
                $query->where('statut', $request->statut);
            }

            // Filtrer par employé assigné
            if ($request->has('id_employe_assigne')) {
                $query->where('id_employe_assigne', $request->id_employe_assigne);
            }

            $reclamations = $query->orderBy('date_ouverture', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $reclamations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réclamations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les détails d'une réclamation
     */
    public function show($id)
    {
        try {
            $reclamation = Reclamation::where('id_reclamation', $id)
                ->where('id_utilisateur', Auth::id())
                ->with(['commande', 'utilisateur'])
                ->first();

            if (!$reclamation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réclamation non trouvée'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $reclamation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la réclamation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assigner une réclamation à un employé (staff uniquement)
     */
    public function assign(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'id_employe_assigne' => 'required|exists:employes,id_employe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reclamation = Reclamation::findOrFail($id);

            $reclamation->update([
                'id_employe_assigne' => $request->id_employe_assigne,
                'statut' => 'en_cours'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Réclamation assignée avec succès',
                'data' => $reclamation->load('employeAssigne')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'assignation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'une réclamation (staff uniquement)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:ouvert,en_cours,en_attente_validation,valide,resolu,rejete',
            'commentaire_resolution' => 'required_if:statut,en_attente_validation,valide,resolu,rejete|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reclamation = Reclamation::findOrFail($id);

            $updateData = [
                'statut' => $request->statut,
            ];

            if ($request->commentaire_resolution) {
                $updateData['commentaire_resolution'] = $request->commentaire_resolution;
            }

            if (in_array($request->statut, ['valide', 'resolu', 'rejete'])) {
                $updateData['date_cloture'] = now();
            }

            $reclamation->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'data' => $reclamation->load(['utilisateur', 'commande', 'employeAssigne'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques des réclamations (staff uniquement)
     */
    public function statistics()
    {
        try {
            $stats = [
                'total' => Reclamation::count(),
                'ouvert' => Reclamation::where('statut', 'ouvert')->count(),
                'en_cours' => Reclamation::where('statut', 'en_cours')->count(),
                'en_attente_validation' => Reclamation::where('statut', 'en_attente_validation')->count(),
                'valide' => Reclamation::where('statut', 'valide')->count(),
                'resolu' => Reclamation::where('statut', 'resolu')->count(),
                'rejete' => Reclamation::where('statut', 'rejete')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
