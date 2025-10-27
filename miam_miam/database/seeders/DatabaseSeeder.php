<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Rôles (doit être en premier)
            RoleSeeder::class,
            
            // 2. Employés (dépend des rôles)
            EmployeSeeder::class,
            
            // 3. Catégories de menu
            CategorieMenuSeeder::class,
            
            // 4. Menu (dépend des catégories)
            MenuSeeder::class,
            
            // 5. Stocks (dépend du menu)
            StockSeeder::class,
            
            // 6. Utilisateurs
            UserSeeder::class,
            
            // 7. Événements et promotions
            EvenementSeeder::class,
            
            // 8. Commandes (dépend de tout le reste)
            CommandeSeeder::class,
        ]);
    }
}
