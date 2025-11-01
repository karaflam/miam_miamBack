<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IntegratedGamesSeeder extends Seeder
{
    /**
     * Seed les jeux intégrés (Blackjack et Quiz Culinaire)
     */
    public function run()
    {
        $now = Carbon::now();
        
        // Vérifier si les jeux existent déjà
        $blackjackExists = DB::table('evenements')
            ->where('code_promo', 'BLACKJACK-INTEGRATED')
            ->exists();
            
        $quizExists = DB::table('evenements')
            ->where('code_promo', 'QUIZ-CULINAIRE-INTEGRATED')
            ->exists();
        
        // Jeu 1: Blackjack
        if (!$blackjackExists) {
            DB::table('evenements')->insert([
                'titre' => 'Blackjack',
                'description' => 'Testez votre chance au Blackjack et gagnez des points de fidélité ! Battez le croupier pour remporter jusqu\'à 50 points.',
                'type' => 'jeu',
                'code_promo' => 'BLACKJACK-INTEGRATED', // Identifiant unique
                'type_remise' => 'point_bonus',
                'valeur_remise' => 50,
                'date_debut' => $now->toDateString(),
                'date_fin' => '2099-12-31', // Date très lointaine
                'active' => 'non', // Désactivé par défaut
                'limite_utilisation' => 3, // 3 parties par jour
                'nombre_utilisation' => 0,
                'url_affiche' => null,
                'is_integrated' => 1, // Marqueur pour jeu intégré (1 = true en BDD)
                'date_creation' => $now,
            ]);
            
            echo "✅ Jeu Blackjack créé avec succès\n";
        } else {
            echo "ℹ️  Jeu Blackjack déjà existant\n";
        }
        
        // Jeu 2: Quiz Culinaire
        if (!$quizExists) {
            DB::table('evenements')->insert([
                'titre' => 'Quiz Culinaire',
                'description' => 'Testez vos connaissances culinaires et gagnez des points ! Répondez correctement aux questions pour gagner jusqu\'à 75 points.',
                'type' => 'jeu',
                'code_promo' => 'QUIZ-CULINAIRE-INTEGRATED', // Identifiant unique
                'type_remise' => 'point_bonus',
                'valeur_remise' => 75,
                'date_debut' => $now->toDateString(),
                'date_fin' => '2099-12-31',
                'active' => 'non', // Désactivé par défaut
                'limite_utilisation' => 5, // 5 quiz par jour
                'nombre_utilisation' => 0,
                'url_affiche' => null,
                'is_integrated' => 1, // Marqueur pour jeu intégré (1 = true en BDD)
                'date_creation' => $now,
            ]);
            
            echo "✅ Jeu Quiz Culinaire créé avec succès\n";
        } else {
            echo "ℹ️  Jeu Quiz Culinaire déjà existant\n";
        }
    }
}
