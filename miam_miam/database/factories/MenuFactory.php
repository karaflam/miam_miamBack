<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\CategorieMenu;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuFactory extends Factory
{
    protected $model = Menu::class;

    public function definition(): array
    {
        return [
            'id_categorie' => CategorieMenu::factory(),
            'nom_article' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'prix' => fake()->numberBetween(1000, 5000),
            'disponible' => 'oui',
            'temps_preparation' => fake()->numberBetween(15, 45),
        ];
    }
}
