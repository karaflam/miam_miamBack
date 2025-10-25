<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Http\Resources\MenuResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    /**
     * Liste tous les articles du menu (publique)
     */
    public function index(Request $request)
    {
        $query = Menu::with('categorie');

        // Filtrer par catégorie si spécifié
        if ($request->has('categorie')) {
            $query->where('id_categorie', $request->categorie);
        }

        // Filtrer par disponibilité (par défaut, seulement les disponibles pour le public)
        if ($request->has('disponible')) {
            $query->where('disponible', $request->disponible);
        } else {
            $query->disponible();
        }

        // Recherche par nom
        if ($request->has('search')) {
            $query->where('nom_article', 'like', '%' . $request->search . '%');
        }

        $menu = $query->orderBy('nom_article')->get();

        return response()->json([
            'success' => true,
            'data' => MenuResource::collection($menu)
        ]);
    }

    /**
     * Affiche un article spécifique
     */
    public function show($id)
    {
        $article = Menu::with('categorie')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new MenuResource($article)
        ]);
    }

    /**
     * Crée un nouvel article (admin/staff uniquement)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom_article' => 'required|string|max:100',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'id_categorie' => 'required|exists:categories_menu,id_categorie',
            'disponible' => 'nullable|in:oui,non',
            'temps_preparation' => 'nullable|integer|min:0',
            'url_image' => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $article = Menu::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Article créé avec succès',
            'data' => new MenuResource($article->load('categorie'))
        ], 201);
    }

    /**
     * Met à jour un article (admin/staff uniquement)
     */
    public function update(Request $request, $id)
    {
        $article = Menu::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom_article' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'prix' => 'sometimes|numeric|min:0',
            'id_categorie' => 'sometimes|exists:categories_menu,id_categorie',
            'disponible' => 'sometimes|in:oui,non',
            'temps_preparation' => 'nullable|integer|min:0',
            'url_image' => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $article->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Article mis à jour avec succès',
            'data' => new MenuResource($article->fresh()->load('categorie'))
        ]);
    }

    /**
     * Supprime un article (admin/staff uniquement)
     */
    public function destroy($id)
    {
        $article = Menu::findOrFail($id);
        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article supprimé avec succès'
        ]);
    }

    /**
     * Bascule la disponibilité d'un article (admin/staff uniquement)
     */
    public function toggleDisponibilite($id)
    {
        $article = Menu::findOrFail($id);
        $article->disponible = $article->disponible === 'oui' ? 'non' : 'oui';
        $article->save();

        return response()->json([
            'success' => true,
            'message' => $article->disponible === 'oui' ? 'Article disponible' : 'Article indisponible',
            'data' => new MenuResource($article->load('categorie'))
        ]);
    }
}
