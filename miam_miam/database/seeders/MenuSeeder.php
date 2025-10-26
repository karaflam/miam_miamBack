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
        // Récupérer les catégories
        $categoriePlats = CategorieMenu::where('nom_categorie', 'Plats principaux')->first();
        $categorieBoissons = CategorieMenu::where('nom_categorie', 'Boissons')->first();
        $categorieDesserts = CategorieMenu::where('nom_categorie', 'Desserts')->first();

        if (!$categoriePlats || !$categorieBoissons || !$categorieDesserts) {
            $this->command->error('Les catégories doivent être créées avant. Exécutez CategorieMenuSeeder d\'abord.');
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
            [
                'nom_article' => 'Koki',
                'description' => 'Gâteau de haricots traditionnel camerounais cuit à la vapeur dans des feuilles de bananier. Riche en protéines et délicieusement parfumé.',
                'prix' => 800,
                'disponible' => 'oui',
                'temps_preparation' => 60,
                'url_image' => 'https://cuisinedecheznous.net/wp-content/uploads/2021/04/168088864_116618263855792_4615947029067243492_n.jpg',
                'id_categorie' => $categoriePlats->id_categorie,
            ],
            [
                'nom_article' => 'Jus d\'Orange',
                'description' => 'Jus d\'orange frais pressé, naturel et vitaminé. Parfait pour accompagner votre repas ou pour une pause rafraîchissante.',
                'prix' => 500,
                'disponible' => 'oui',
                'temps_preparation' => 5,
                'url_image' => 'https://plus.unsplash.com/premium_photo-1675667390417-d9d23160f4a6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8anVzJTIwZGUlMjBiaXNzYXB8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600',
                'id_categorie' => $categorieBoissons->id_categorie,
            ],
            [
                'nom_article' => 'Café',
                'description' => 'Café arabica fraîchement moulu et préparé. Un arôme intense pour bien démarrer la journée ou accompagner votre dessert.',
                'prix' => 300,
                'disponible' => 'oui',
                'temps_preparation' => 5,
                'url_image' => 'https://plus.unsplash.com/premium_photo-1673545518947-ddf3240090b1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FmJUMzJUE5fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600',
                'id_categorie' => $categorieBoissons->id_categorie,
            ],
            [
                'nom_article' => 'Dessert Oreo',
                'description' => 'Délicieux dessert crémeux aux biscuits Oreo. Une explosion de saveurs chocolatées et onctueuses pour terminer votre repas en beauté.',
                'prix' => 800,
                'disponible' => 'oui',
                'temps_preparation' => 10,
                'url_image' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGVzc2VydHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600',
                'id_categorie' => $categorieDesserts->id_categorie,
            ],
        ];

        foreach ($plats as $plat) {
            Menu::firstOrCreate(
                ['nom_article' => $plat['nom_article']],
                $plat
            );
        }

        $this->command->info('Articles du menu créés avec succès!');
        $this->command->info('');
        $this->command->info('=== PLATS PRINCIPAUX ===');
        $this->command->info('- Ndolé (1000 FCFA)');
        $this->command->info('- Poulet Rôti (1500 FCFA)');
        $this->command->info('- Eru (1000 FCFA)');
        $this->command->info('- Okok (1000 FCFA)');
        $this->command->info('- Poulet DG (2000 FCFA)');
        $this->command->info('- Koki (800 FCFA)');
        $this->command->info('');
        $this->command->info('=== BOISSONS ===');
        $this->command->info('- Jus d\'Orange (500 FCFA)');
        $this->command->info('- Café (300 FCFA)');
        $this->command->info('');
        $this->command->info('=== DESSERTS ===');
        $this->command->info('- Dessert Oreo (800 FCFA)');
    }
}
