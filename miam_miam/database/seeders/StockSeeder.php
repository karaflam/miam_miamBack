<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Stock;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = Menu::all();

        if ($menus->isEmpty()) {
            $this->command->error('Veuillez d\'abord créer des articles de menu.');
            return;
        }

        foreach ($menus as $menu) {
            // Vérifier si le stock existe déjà
            $stockExistant = Stock::where('id_article', $menu->id_article)->first();

            if (!$stockExistant) {
                // Déterminer la quantité initiale selon le type d'article
                $quantiteInitiale = $this->getQuantiteInitiale($menu->prix);

                Stock::create([
                    'id_article' => $menu->id_article,
                    'quantite_disponible' => $quantiteInitiale,
                    'seuil_alerte' => $this->getSeuilAlerte($quantiteInitiale),
                    'date_mise_a_jour' => now(),
                ]);
            }
        }

        $this->command->info('Stocks initialisés avec succès!');
    }

    private function getQuantiteInitiale($prix)
    {
        // Plus le prix est élevé, moins on a de stock initial
        if ($prix >= 1500) {
            return rand(30, 50); // Plats principaux chers
        } elseif ($prix >= 800) {
            return rand(50, 80); // Plats moyens
        } else {
            return rand(80, 150); // Boissons et snacks
        }
    }

    private function getSeuilAlerte($quantiteInitiale)
    {
        // Seuil d'alerte à 20% du stock initial
        return max(10, floor($quantiteInitiale * 0.2));
    }
}
