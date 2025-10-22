<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CategorieMenu;
use App\Models\Menu;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ImportExistingDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Créer les catégories de menu (si elles n'existent pas)
        $categories = [
            ['nom_categorie' => 'Pizzas', 'description' => 'Pizzas variées'],
            ['nom_categorie' => 'Burgers', 'description' => 'Burgers et sandwiches'],
            ['nom_categorie' => 'Plats', 'description' => 'Plats principaux'],
            ['nom_categorie' => 'Boissons', 'description' => 'Boissons et jus'],
            ['nom_categorie' => 'Desserts', 'description' => 'Desserts et glaces'],
        ];

        foreach ($categories as $cat) {
            CategorieMenu::firstOrCreate(
                ['nom_categorie' => $cat['nom_categorie']],
                $cat
            );
        }

        // 2. Créer les utilisateurs existants (si ils n'existent pas)
        $users = [
            [
                'nom' => 'Admin',
                'prenom' => 'Super',
                'email' => 'admin@zeducspace.com',
                'mot_de_passe' => Hash::make('admin123'),
                'telephone' => '+237600000001',
                'code_parrainage' => 'ADMIN2024',
                'point_fidelite' => 0,
                'statut' => 'actif',
            ],
            [
                'nom' => 'Miam',
                'prenom' => 'Miam',
                'email' => 'gerant@zeducspace.com',
                'mot_de_passe' => Hash::make('gerant123'),
                'telephone' => '+237600000002',
                'code_parrainage' => 'GERANT2024',
                'point_fidelite' => 0,
                'statut' => 'actif',
            ],
            [
                'nom' => 'Kouam',
                'prenom' => 'Jean',
                'email' => 'kouam.jean@student.ucac-icam.cm',
                'mot_de_passe' => Hash::make('student123'),
                'telephone' => '+237600000003',
                'code_parrainage' => 'KOUAM2024',
                'point_fidelite' => 150,
                'statut' => 'actif',
            ],
            [
                'nom' => 'Ngo',
                'prenom' => 'Marie',
                'email' => 'ngo.marie@student.ucac-icam.cm',
                'mot_de_passe' => Hash::make('student123'),
                'telephone' => '+237600000004',
                'code_parrainage' => 'NGO2024',
                'point_fidelite' => 75,
                'statut' => 'actif',
            ],
            [
                'nom' => 'Fotso',
                'prenom' => 'Paul',
                'email' => 'fotso.paul@student.ucac-icam.cm',
                'mot_de_passe' => Hash::make('student123'),
                'telephone' => '+237600000005',
                'code_parrainage' => 'FOTSO2024',
                'point_fidelite' => 200,
                'statut' => 'actif',
            ],
            [
                'nom' => 'Tchoumi',
                'prenom' => 'Grace',
                'email' => 'tchoumi.grace@student.ucac-icam.cm',
                'mot_de_passe' => Hash::make('student123'),
                'telephone' => '+237600000006',
                'code_parrainage' => 'TCHOUMI24',
                'point_fidelite' => 50,
                'statut' => 'actif',
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        // 3. Créer les articles du menu
        $menuItems = [
            // Pizzas
            ['id_categorie' => 1, 'nom_article' => 'Pizza Margherita', 'description' => 'Pizza avec tomate, mozzarella et basilic', 'prix' => 1500, 'disponible' => 'oui', 'temps_preparation' => 20],
            ['id_categorie' => 1, 'nom_article' => 'Pizza Pepperoni', 'description' => 'Pizza avec pepperoni et fromage', 'prix' => 1800, 'disponible' => 'oui', 'temps_preparation' => 20],
            ['id_categorie' => 1, 'nom_article' => 'Pizza 4 Fromages', 'description' => 'Pizza avec 4 types de fromages', 'prix' => 2000, 'disponible' => 'oui', 'temps_preparation' => 25],
            
            // Burgers
            ['id_categorie' => 2, 'nom_article' => 'Burger Classique', 'description' => 'Burger avec steak, salade, tomate et oignons', 'prix' => 1200, 'disponible' => 'oui', 'temps_preparation' => 15],
            ['id_categorie' => 2, 'nom_article' => 'Burger Chicken', 'description' => 'Burger avec poulet pané et salade', 'prix' => 1400, 'disponible' => 'oui', 'temps_preparation' => 15],
            
            // Plats
            ['id_categorie' => 3, 'nom_article' => 'Poulet Rôti', 'description' => 'Poulet rôti avec frites et salade', 'prix' => 1600, 'disponible' => 'oui', 'temps_preparation' => 30],
            ['id_categorie' => 3, 'nom_article' => 'Poisson Braisé', 'description' => 'Poisson braisé avec plantain et légumes', 'prix' => 1800, 'disponible' => 'oui', 'temps_preparation' => 25],
            ['id_categorie' => 3, 'nom_article' => 'Riz au Poulet', 'description' => 'Riz parfumé avec poulet et légumes', 'prix' => 1000, 'disponible' => 'oui', 'temps_preparation' => 20],
            
            // Boissons
            ['id_categorie' => 4, 'nom_article' => 'Coca-Cola', 'description' => 'Boisson gazeuse 33cl', 'prix' => 500, 'disponible' => 'oui', 'temps_preparation' => 5],
            ['id_categorie' => 4, 'nom_article' => 'Fanta Orange', 'description' => 'Boisson gazeuse orange 33cl', 'prix' => 500, 'disponible' => 'oui', 'temps_preparation' => 5],
            ['id_categorie' => 4, 'nom_article' => 'Eau Minérale', 'description' => 'Eau minérale 50cl', 'prix' => 300, 'disponible' => 'oui', 'temps_preparation' => 2],
            
            // Desserts
            ['id_categorie' => 5, 'nom_article' => 'Glace Vanille', 'description' => 'Glace à la vanille', 'prix' => 600, 'disponible' => 'oui', 'temps_preparation' => 5],
            ['id_categorie' => 5, 'nom_article' => 'Glace Chocolat', 'description' => 'Glace au chocolat', 'prix' => 600, 'disponible' => 'oui', 'temps_preparation' => 5],
        ];

        foreach ($menuItems as $item) {
            Menu::create($item);
        }

        $this->command->info('Données existantes importées avec succès !');
        $this->command->info('Utilisateurs créés :');
        $this->command->info('- admin@zeducspace.com (mot de passe: admin123)');
        $this->command->info('- gerant@zeducspace.com (mot de passe: gerant123)');
        $this->command->info('- tchoumi.grace@student.ucac-icam.cm (mot de passe: student123)');
        $this->command->info('- Et d\'autres étudiants...');
    }
}
