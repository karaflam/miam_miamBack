<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StockController extends Controller
{
    /**
     * Mettre à jour le stock d'un article
     */
    public function update(Request $request, $id_article)
    {
        $validator = Validator::make($request->all(), [
            'quantite_disponible' => 'required|integer|min:0',
            'seuil_alerte' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier que l'article existe
        $article = Menu::findOrFail($id_article);

        // Créer ou mettre à jour le stock
        $stock = Stock::updateOrCreate(
            ['id_article' => $id_article],
            [
                'quantite_disponible' => $request->quantite_disponible,
                'seuil_alerte' => $request->seuil_alerte ?? 5,
                'date_mise_a_jour' => now()
            ]
        );

        // Mettre à jour automatiquement la disponibilité de l'article
        if ($stock->quantite_disponible <= 0) {
            $article->disponible = 'non';
            $article->save();
        } else if ($stock->quantite_disponible > 0 && $article->disponible === 'non') {
            // Réactiver l'article si le stock est reconstitué
            $article->disponible = 'oui';
            $article->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock mis à jour avec succès',
            'data' => [
                'id_stock' => $stock->id_stock,
                'id_article' => $stock->id_article,
                'quantite_disponible' => $stock->quantite_disponible,
                'seuil_alerte' => $stock->seuil_alerte,
                'en_rupture' => $stock->quantite_disponible <= 0,
                'alerte_stock' => $stock->quantite_disponible <= $stock->seuil_alerte && $stock->quantite_disponible > 0,
                'article_disponible' => $article->disponible
            ]
        ]);
    }

    /**
     * Ajuster le stock (ajouter ou retirer)
     */
    public function adjust(Request $request, $id_article)
    {
        $validator = Validator::make($request->all(), [
            'ajustement' => 'required|integer', // Positif pour ajouter, négatif pour retirer
            'raison' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $article = Menu::findOrFail($id_article);
        
        $stock = Stock::where('id_article', $id_article)->first();
        
        if (!$stock) {
            return response()->json([
                'success' => false,
                'message' => 'Stock non initialisé pour cet article'
            ], 404);
        }

        $nouvelle_quantite = $stock->quantite_disponible + $request->ajustement;
        
        if ($nouvelle_quantite < 0) {
            return response()->json([
                'success' => false,
                'message' => 'La quantité ne peut pas être négative'
            ], 422);
        }

        $stock->quantite_disponible = $nouvelle_quantite;
        $stock->date_mise_a_jour = now();
        $stock->save();

        // Mettre à jour automatiquement la disponibilité de l'article
        if ($stock->quantite_disponible <= 0) {
            $article->disponible = 'non';
            $article->save();
        } else if ($stock->quantite_disponible > 0 && $article->disponible === 'non') {
            // Réactiver l'article si le stock est reconstitué
            $article->disponible = 'oui';
            $article->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock ajusté avec succès',
            'data' => [
                'id_stock' => $stock->id_stock,
                'id_article' => $stock->id_article,
                'quantite_disponible' => $stock->quantite_disponible,
                'ajustement' => $request->ajustement,
                'raison' => $request->raison,
                'en_rupture' => $stock->quantite_disponible <= 0,
                'alerte_stock' => $stock->quantite_disponible <= $stock->seuil_alerte && $stock->quantite_disponible > 0,
                'article_disponible' => $article->disponible
            ]
        ]);
    }

    /**
     * Décrémenter le stock lors d'une commande
     * Cette méthode est appelée automatiquement lors de la validation d'une commande
     */
    public function decrementStock($id_article, $quantite)
    {
        $article = Menu::find($id_article);
        
        if (!$article) {
            return [
                'success' => false,
                'message' => 'Article non trouvé'
            ];
        }

        $stock = Stock::where('id_article', $id_article)->first();
        
        if (!$stock) {
            // Si le stock n'existe pas, créer un stock avec quantité 0
            $stock = Stock::create([
                'id_article' => $id_article,
                'quantite_disponible' => 0,
                'seuil_alerte' => 5,
                'date_mise_a_jour' => now()
            ]);
        }

        $nouvelle_quantite = $stock->quantite_disponible - $quantite;
        
        if ($nouvelle_quantite < 0) {
            return [
                'success' => false,
                'message' => 'Stock insuffisant pour ' . $article->nom
            ];
        }

        $stock->quantite_disponible = $nouvelle_quantite;
        $stock->date_mise_a_jour = now();
        $stock->save();

        // Mettre à jour automatiquement la disponibilité de l'article
        if ($stock->quantite_disponible <= 0) {
            $article->disponible = 'non';
            $article->save();
        }

        return [
            'success' => true,
            'message' => 'Stock décrémenté avec succès',
            'quantite_restante' => $stock->quantite_disponible,
            'en_rupture' => $stock->quantite_disponible <= 0,
            'alerte_stock' => $stock->quantite_disponible <= $stock->seuil_alerte && $stock->quantite_disponible > 0
        ];
    }

    /**
     * Obtenir les articles en rupture de stock
     */
    public function ruptures()
    {
        $ruptures = Stock::with('menu.categorie')
            ->where('quantite_disponible', '<=', 0)
            ->get()
            ->map(function($stock) {
                return [
                    'id_article' => $stock->id_article,
                    'nom_article' => $stock->menu->nom_article,
                    'categorie' => $stock->menu->categorie->nom ?? null,
                    'quantite_disponible' => $stock->quantite_disponible
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ruptures
        ]);
    }

    /**
     * Obtenir les articles en alerte de stock
     */
    public function alertes()
    {
        $alertes = Stock::with('menu.categorie')
            ->whereColumn('quantite_disponible', '<=', 'seuil_alerte')
            ->where('quantite_disponible', '>', 0)
            ->get()
            ->map(function($stock) {
                return [
                    'id_article' => $stock->id_article,
                    'nom_article' => $stock->menu->nom_article,
                    'categorie' => $stock->menu->categorie->nom ?? null,
                    'quantite_disponible' => $stock->quantite_disponible,
                    'seuil_alerte' => $stock->seuil_alerte
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $alertes
        ]);
    }
}
