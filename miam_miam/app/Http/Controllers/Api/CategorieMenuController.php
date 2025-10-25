<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategorieMenu;
use App\Http\Resources\CategorieResource;
use Illuminate\Http\Request;

class CategorieMenuController extends Controller
{
    /**
     * Liste toutes les catégories
     */
    public function index()
    {
        $categories = CategorieMenu::orderBy('nom_categorie')->get();

        return response()->json([
            'success' => true,
            'data' => CategorieResource::collection($categories)
        ]);
    }

    /**
     * Affiche une catégorie spécifique avec ses articles
     */
    public function show($id)
    {
        $categorie = CategorieMenu::with(['menus' => function($query) {
            $query->where('disponible', 'oui')->orderBy('nom_article');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new CategorieResource($categorie)
        ]);
    }
}
