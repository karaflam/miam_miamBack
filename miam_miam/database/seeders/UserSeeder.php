<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => 'test@example.com',
            'mot_de_passe' => Hash::make('password'),
            'telephone' => '123456789',
            'code_parrainage' => 'TEST123',
            'point_fidelite' => 0,
            'statut' => 'actif',
        ]);
    }
}