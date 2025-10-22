<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdaptExistingDatabase extends Command
{
    protected $signature = 'db:adapt-existing';
    protected $description = 'Adapter la base de données existante pour Laravel';

    public function handle()
    {
        $this->info('Adaptation de la base de données existante...');

        try {
            // 1. Vérifier si la table users existe
            if (!DB::getSchemaBuilder()->hasTable('users')) {
                $this->error('La table users n\'existe pas. Veuillez d\'abord créer la structure Laravel.');
                return 1;
            }

            // 2. Ajouter les colonnes manquantes
            $this->info('Ajout des colonnes manquantes...');
            
            if (!DB::getSchemaBuilder()->hasColumn('users', 'code_parrainage')) {
                DB::statement('ALTER TABLE users ADD COLUMN code_parrainage VARCHAR(10) UNIQUE');
            }
            
            if (!DB::getSchemaBuilder()->hasColumn('users', 'id_parrain')) {
                DB::statement('ALTER TABLE users ADD COLUMN id_parrain BIGINT');
            }
            
            if (!DB::getSchemaBuilder()->hasColumn('users', 'point_fidelite')) {
                DB::statement('ALTER TABLE users ADD COLUMN point_fidelite INTEGER DEFAULT 0');
            }
            
            if (!DB::getSchemaBuilder()->hasColumn('users', 'statut')) {
                DB::statement('ALTER TABLE users ADD COLUMN statut VARCHAR(10) DEFAULT \'actif\'');
            }
            
            if (!DB::getSchemaBuilder()->hasColumn('users', 'localisation')) {
                DB::statement('ALTER TABLE users ADD COLUMN localisation TEXT');
            }

            // 3. Mettre à jour les utilisateurs existants
            $this->info('Mise à jour des utilisateurs existants...');
            
            $users = [
                'admin@zeducspace.com' => 'ADMIN2024',
                'gerant@zeducspace.com' => 'GERANT2024',
                'kouam.jean@student.ucac-icam.cm' => 'KOUAM2024',
                'ngo.marie@student.ucac-icam.cm' => 'NGO2024',
                'fotso.paul@student.ucac-icam.cm' => 'FOTSO2024',
                'tchoumi.grace@student.ucac-icam.cm' => 'TCHOUMI24',
                'mballa.david@student.ucac-icam.cm' => 'MBALLA2024',
                'ngono.sarah@student.ucac-icam.cm' => 'NGONO2024',
                'tchakounte.junior@student.ucac-icam.cm' => 'TCHAK2024',
                'nguema.patricia@student.ucac-icam.cm' => 'NGUEMA2024',
            ];

            foreach ($users as $email => $code) {
                DB::table('users')
                    ->where('email', $email)
                    ->update([
                        'code_parrainage' => $code,
                        'statut' => 'actif',
                        'point_fidelite' => DB::raw('COALESCE(point_fidelite, 0)')
                    ]);
            }

            // 4. Créer les catégories de menu
            $this->info('Création des catégories de menu...');
            
            $categories = [
                ['nom_categorie' => 'Pizzas', 'description' => 'Pizzas variées'],
                ['nom_categorie' => 'Burgers', 'description' => 'Burgers et sandwiches'],
                ['nom_categorie' => 'Plats', 'description' => 'Plats principaux'],
                ['nom_categorie' => 'Boissons', 'description' => 'Boissons et jus'],
                ['nom_categorie' => 'Desserts', 'description' => 'Desserts et glaces'],
            ];

            foreach ($categories as $cat) {
                DB::table('categories_menu')->insertOrIgnore($cat);
            }

            // 5. Créer le menu
            $this->info('Création du menu...');
            
            $menuItems = [
                ['id_categorie' => 1, 'nom_article' => 'Pizza Margherita', 'description' => 'Pizza avec tomate, mozzarella et basilic', 'prix' => 1500, 'disponible' => 'oui', 'temps_preparation' => 20],
                ['id_categorie' => 1, 'nom_article' => 'Pizza Pepperoni', 'description' => 'Pizza avec pepperoni et fromage', 'prix' => 1800, 'disponible' => 'oui', 'temps_preparation' => 20],
                ['id_categorie' => 1, 'nom_article' => 'Pizza 4 Fromages', 'description' => 'Pizza avec 4 types de fromages', 'prix' => 2000, 'disponible' => 'oui', 'temps_preparation' => 25],
                ['id_categorie' => 2, 'nom_article' => 'Burger Classique', 'description' => 'Burger avec steak, salade, tomate et oignons', 'prix' => 1200, 'disponible' => 'oui', 'temps_preparation' => 15],
                ['id_categorie' => 2, 'nom_article' => 'Burger Chicken', 'description' => 'Burger avec poulet pané et salade', 'prix' => 1400, 'disponible' => 'oui', 'temps_preparation' => 15],
                ['id_categorie' => 3, 'nom_article' => 'Poulet Rôti', 'description' => 'Poulet rôti avec frites et salade', 'prix' => 1600, 'disponible' => 'oui', 'temps_preparation' => 30],
                ['id_categorie' => 3, 'nom_article' => 'Poisson Braisé', 'description' => 'Poisson braisé avec plantain et légumes', 'prix' => 1800, 'disponible' => 'oui', 'temps_preparation' => 25],
                ['id_categorie' => 3, 'nom_article' => 'Riz au Poulet', 'description' => 'Riz parfumé avec poulet et légumes', 'prix' => 1000, 'disponible' => 'oui', 'temps_preparation' => 20],
                ['id_categorie' => 4, 'nom_article' => 'Coca-Cola', 'description' => 'Boisson gazeuse 33cl', 'prix' => 500, 'disponible' => 'oui', 'temps_preparation' => 5],
                ['id_categorie' => 4, 'nom_article' => 'Fanta Orange', 'description' => 'Boisson gazeuse orange 33cl', 'prix' => 500, 'disponible' => 'oui', 'temps_preparation' => 5],
                ['id_categorie' => 4, 'nom_article' => 'Eau Minérale', 'description' => 'Eau minérale 50cl', 'prix' => 300, 'disponible' => 'oui', 'temps_preparation' => 2],
                ['id_categorie' => 5, 'nom_article' => 'Glace Vanille', 'description' => 'Glace à la vanille', 'prix' => 600, 'disponible' => 'oui', 'temps_preparation' => 5],
                ['id_categorie' => 5, 'nom_article' => 'Glace Chocolat', 'description' => 'Glace au chocolat', 'prix' => 600, 'disponible' => 'oui', 'temps_preparation' => 5],
            ];

            foreach ($menuItems as $item) {
                DB::table('menus')->insertOrIgnore($item);
            }

            $this->info('✅ Base de données adaptée avec succès !');
            $this->info('Vos utilisateurs existants sont maintenant compatibles avec Laravel.');
            
            return 0;

        } catch (\Exception $e) {
            $this->error('Erreur lors de l\'adaptation : ' . $e->getMessage());
            return 1;
        }
    }
}