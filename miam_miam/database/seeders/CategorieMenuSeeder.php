<?php

namespace Database\Seeders;

use App\Models\CategorieMenu;
use Illuminate\Database\Seeder;

class CategorieMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'nom_categorie' => 'Plats principaux',
                'description' => 'Plats chauds et copieux',
            ],
            [
                'nom_categorie' => 'Boissons',
                'description' => 'Boissons fraîches et chaudes',
            ],
            [
                'nom_categorie' => 'Desserts',
                'description' => 'Douceurs sucrées',
            ],
            [
                'nom_categorie' => 'Entrées',
                'description' => 'Petites entrées et snacks',
            ],
        ];

        foreach ($categories as $categorie) {
            CategorieMenu::firstOrCreate(
                ['nom_categorie' => $categorie['nom_categorie']],
                $categorie
            );
        }
    }
}