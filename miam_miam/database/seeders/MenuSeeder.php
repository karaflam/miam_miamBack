<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\CategorieMenu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer la catégorie "Plats principaux"
        $categoriePlats = CategorieMenu::where('nom_categorie', 'Plats principaux')->first();

        if (!$categoriePlats) {
            $this->command->error('La catégorie "Plats principaux" doit être créée avant. Exécutez CategorieMenuSeeder d\'abord.');
            return;
        }

        $plats = [
            [
                'nom_article' => 'Ndolé',
                'description' => 'Plat traditionnel camerounais à base de feuilles de ndolé, d\'arachides et de viande ou poisson. Un délice savoureux et authentique.',
                'prix' => 1000,
                'disponible' => 'oui',
                'temps_preparation' => 45,
                'url_image' => 'https://prod.cdn-medias.jeuneafrique.com/cdn-cgi/image/q=auto,f=auto,metadata=none,width=1215,fit=cover/https://prod.cdn-medias.jeuneafrique.com/medias/2020/12/23/jad20201223-ass-cuisine-ndole.jpg',
                'id_categorie' => $categoriePlats->id_categorie,
            ],
            [
                'nom_article' => 'Poulet Rôti',
                'description' => 'Poulet entier rôti à la perfection, doré et croustillant à l\'extérieur, tendre et juteux à l\'intérieur. Accompagné de légumes grillés.',
                'prix' => 1500,
                'disponible' => 'oui',
                'temps_preparation' => 60,
                'url_image' => 'https://img-3.journaldesfemmes.fr/bXkNDfcjEiK0tBVXS9k6K-2Y1vU=/750x500/3c4947934604405a830dab37ab6c172a/ccmcms-jdf/40007820.jpg',
                'id_categorie' => $categoriePlats->id_categorie,
            ],
            [
                'nom_article' => 'Eru',
                'description' => 'Soupe traditionnelle camerounaise à base de feuilles d\'eru (okok sauvage) et de viande fumée. Un plat riche en saveurs et en traditions.',
                'prix' => 1000,
                'disponible' => 'oui',
                'temps_preparation' => 50,
                'url_image' => 'https://afrocuisine.co/wp-content/uploads/2022/04/eru.jpg',
                'id_categorie' => $categoriePlats->id_categorie,
            ],
            [
                'nom_article' => 'Okok',
                'description' => 'Plat camerounais préparé avec des feuilles de gnetum (okok), des arachides et du poisson fumé. Une explosion de saveurs authentiques.',
                'prix' => 1000,
                'disponible' => 'oui',
                'temps_preparation' => 40,
                'url_image' => 'https://glance-magazine.com/wp-content/uploads/2024/10/Okok-800x445.jpg',
                'id_categorie' => $categoriePlats->id_categorie,
            ],
            [
                'nom_article' => 'Poulet DG',
                'description' => 'Le fameux Poulet Directeur Général ! Poulet sauté avec des légumes frais (plantains, carottes, haricots verts) dans une sauce savoureuse.',
                'prix' => 2000,
                'disponible' => 'oui',
                'temps_preparation' => 55,
                'url_image' => 'https://chickenexplore.ch/wp-content/uploads/2025/01/poulet_DG.jpg',
                'id_categorie' => $categoriePlats->id_categorie,
            ],
        ];

        foreach ($plats as $plat) {
            Menu::firstOrCreate(
                ['nom_article' => $plat['nom_article']],
                $plat
            );
        }

        $this->command->info('Plats camerounais créés avec succès!');
        $this->command->info('- Ndolé (1000 FCFA)');
        $this->command->info('- Poulet Rôti (1500 FCFA)');
        $this->command->info('- Eru (1000 FCFA)');
        $this->command->info('- Okok (1000 FCFA)');
        $this->command->info('- Poulet DG (2000 FCFA)');
    }
}
