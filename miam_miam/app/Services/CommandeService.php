<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\Commande;

class CommandeService
{
    public function verifierStock(array $articles): bool
    {
        foreach ($articles as $article) {
            $stock = Stock::where('id_article', $article['id'])->first();
            if (!$stock || $stock->quantite_disponible < $article['quantite']) {
                throw new \Exception("Stock insuffisant pour {$article['nom']}");
            }
        }
        return true;
    }

    public function decrementerStock(Commande $commande): void
    {
        foreach ($commande->details as $detail) {
            $stock = Stock::where('id_article', $detail->id_article)->first();
            if ($stock) {
                $stock->decrement('quantite_disponible', $detail->quantite);
            }
        }
    }
}
