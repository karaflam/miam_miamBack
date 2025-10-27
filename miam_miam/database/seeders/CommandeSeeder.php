<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Menu;
use App\Models\Commande;
use App\Models\DetailCommande;
use App\Models\Paiement;
use App\Models\Evenement;
use App\Models\UsagePromo;
use App\Models\SuiviPoint;
use App\Models\Stock;
use Carbon\Carbon;

class CommandeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Création des commandes...');

        $users = User::all();
        $menus = Menu::all();
        $promos = Evenement::where('type', 'promotion')->where('active', 'oui')->get();

        if ($users->isEmpty() || $menus->isEmpty()) {
            $this->command->error('Veuillez d\'abord créer des utilisateurs et des articles de menu.');
            return;
        }

        // Générer des commandes pour les 3 derniers mois
        $startDate = Carbon::now()->subMonths(3);
        $endDate = Carbon::now();

        $totalCommandes = 0;

        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            // 3 à 8 commandes par jour
            $nbCommandes = rand(3, 8);

            for ($i = 0; $i < $nbCommandes; $i++) {
                $user = $users->random();
                $dateCommande = $date->copy()->addHours(rand(8, 20))->addMinutes(rand(0, 59));

                // Sélectionner 1 à 3 articles
                $selectedMenus = $menus->random(rand(1, 3));
                $montantTotal = 0;
                $details = [];

                foreach ($selectedMenus as $menu) {
                    $quantite = rand(1, 2);
                    $sousTotal = $menu->prix * $quantite;
                    $montantTotal += $sousTotal;

                    $details[] = [
                        'id_article' => $menu->id_article,
                        'quantite' => $quantite,
                        'prix_unitaire' => $menu->prix,
                        // sous_total est calculé automatiquement par la base de données
                    ];
                }

                // Appliquer une promo aléatoirement (25% de chance)
                $promo = null;
                $montantRemise = 0;
                if (rand(1, 100) <= 25 && $promos->count() > 0) {
                    $promo = $promos->random();
                    if ($promo->type_remise === 'pourcentage') {
                        $montantRemise = ($montantTotal * $promo->valeur_remise) / 100;
                    } else {
                        $montantRemise = min($promo->valeur_remise, $montantTotal);
                    }
                }

                $montantFinal = $montantTotal - $montantRemise;

                // Déterminer le statut selon l'ancienneté
                $statut = $this->getRandomStatut($dateCommande);

                // Déterminer le mode de paiement
                $methodePaiement = rand(1, 10) > 3 ? 'mobile_money' : 'points_fidelite';
                
                // Créer la commande
                $commande = Commande::create([
                    'id_utilisateur' => $user->id_utilisateur,
                    'date_commande' => $dateCommande,
                    'montant_total' => $montantTotal,
                    'montant_remise' => $montantRemise,
                    'montant_final' => $montantFinal,
                    'statut_commande' => $statut,
                    'type_livraison' => rand(1, 10) > 5 ? 'livraison' : 'sur_place',
                    'adresse_livraison' => $this->getRandomAddress(),
                ]);

                // Créer les détails de commande
                foreach ($details as $detail) {
                    DetailCommande::create(array_merge($detail, [
                        'id_commande' => $commande->id_commande,
                    ]));

                    // Mettre à jour le stock
                    $stock = Stock::where('id_article', $detail['id_article'])->first();
                    if ($stock && $statut !== 'annulee') {
                        $stock->decrement('quantite_disponible', $detail['quantite']);
                    }
                }

                // Créer le paiement
                $statutPaiement = $statut === 'annulee' ? 'echoue' : 'reussi';
                Paiement::create([
                    'id_commande' => $commande->id_commande,
                    'id_utilisateur' => $user->id_utilisateur,
                    'montant' => $montantFinal,
                    'methode_paiement' => $methodePaiement,
                    'statut_paiement' => $statutPaiement,
                    'date_paiement' => $dateCommande,
                    'identifiant_transaction' => 'TXN' . strtoupper(uniqid()),
                ]);

                // Ajouter l'usage promo si applicable
                if ($promo) {
                    UsagePromo::create([
                        'id_evenement' => $promo->id_evenement,
                        'id_commande' => $commande->id_commande,
                        'id_utilisateur' => $user->id_utilisateur,
                        'montant_remise' => $montantRemise,
                        'date_utilisation' => $dateCommande,
                    ]);

                    // Incrémenter le nombre d'utilisations
                    $promo->increment('nombre_utilisation');
                }

                // Ajouter des points de fidélité si commande livrée
                if ($statut === 'livree') {
                    $points = floor($montantFinal / 1000);
                    if ($points > 0) {
                        $user->increment('point_fidelite', $points);
                        $user->refresh();

                        SuiviPoint::create([
                            'id_utilisateur' => $user->id_utilisateur,
                            'id_commande' => $commande->id_commande,
                            'variation_points' => $points,
                            'solde_apres' => $user->point_fidelite,
                            'source_points' => 'commande',
                        ]);
                    }
                }

                $totalCommandes++;
            }
        }

        $this->command->info("✅ {$totalCommandes} commandes créées avec succès!");
        $this->command->info('- Détails de commandes générés');
        $this->command->info('- Paiements enregistrés');
        $this->command->info('- Promotions appliquées (25% des commandes)');
        $this->command->info('- Points de fidélité distribués');
        $this->command->info('- Stocks mis à jour');
    }

    private function getRandomStatut($dateCommande)
    {
        $daysSince = Carbon::now()->diffInDays($dateCommande);

        if ($daysSince > 7) {
            // Anciennes commandes: 85% livrées, 10% annulées, 5% prête
            $rand = rand(1, 100);
            if ($rand <= 85) return 'livree';
            if ($rand <= 95) return 'annulee';
            return 'prete';
        } elseif ($daysSince > 2) {
            // Commandes récentes: 70% livrées, 20% prête, 10% en préparation
            $rand = rand(1, 100);
            if ($rand <= 70) return 'livree';
            if ($rand <= 90) return 'prete';
            return 'en_preparation';
        } else {
            // Commandes très récentes: distribution variée
            $statuts = ['en_attente', 'validee', 'en_preparation', 'prete', 'livree'];
            return $statuts[array_rand($statuts)];
        }
    }

    private function getRandomAddress()
    {
        $addresses = [
            'Campus Universitaire, Yaoundé',
            'Résidence Universitaire, Ngoa Ekelle',
            'Cité Universitaire, Yaoundé',
            'Quartier Messa, Yaoundé',
            'Quartier Ngousso, Yaoundé',
            'Quartier Emana, Yaoundé',
            'Quartier Essos, Yaoundé',
            'Quartier Bastos, Yaoundé',
            'Campus UCAD, Dakar',
            'Cité Universitaire, Dakar',
        ];

        return $addresses[array_rand($addresses)];
    }
}
