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
     * Créer une nouvelle réclamation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_commande' => 'nullable|exists:commandes,id_commande',
            'type_reclamation' => 'required|string|max:100',
            'description' => 'required|string',
            'priorite' => 'required|in:basse,moyenne,haute',
        ], [
            'type_reclamation.required' => 'Le type de réclamation est obligatoire',
            'description.required' => 'La description est obligatoire',
            'priorite.required' => 'La priorité est obligatoire',
            'priorite.in' => 'La priorité doit être : basse, moyenne ou haute',
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
                'type_reclamation' => $request->type_reclamation,
                'description' => $request->description,
                'priorite' => $request->priorite,
                'statut' => 'en_attente',
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
                ->with(['commande', 'utilisateur'])
                ->orderBy('date_reclamation', 'desc')
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
     * Annuler une réclamation
     */
    public function cancel($id)
    {
        try {
            $reclamation = Reclamation::where('id_reclamation', $id)
                ->where('id_utilisateur', Auth::id())
                ->first();

            if (!$reclamation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réclamation non trouvée'
                ], 404);
            }

            if ($reclamation->statut === 'resolue' || $reclamation->statut === 'annulee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette réclamation ne peut plus être annulée'
                ], 400);
            }

            $reclamation->update([
                'statut' => 'annulee',
                'date_resolution' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Réclamation annulée avec succès',
                'data' => $reclamation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de la réclamation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
