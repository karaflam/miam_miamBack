<?php

namespace Database\Factories;

use App\Models\CategorieMenu;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategorieMenuFactory extends Factory
{
    protected $model = CategorieMenu::class;

    public function definition(): array
    {
        return [
            'nom_categorie' => fake()->randomElement(['Plats', 'Boissons', 'Desserts', 'Entrées']),
            'description' => fake()->sentence(),
        ];
    }
}
