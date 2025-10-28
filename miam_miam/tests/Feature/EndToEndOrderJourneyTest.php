<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Menu;
use App\Models\CategorieMenu;
use App\Models\Stock;
use App\Models\Commande;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test End-to-End du parcours complet d'un utilisateur
 * De l'inscription à la livraison de la commande
 */
class EndToEndOrderJourneyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function complete_user_journey_from_registration_to_order_delivery()
    {
        // ========================================
        // ÉTAPE 1: Inscription d'un nouvel utilisateur
        // ========================================
        $registrationResponse = $this->postJson('/api/auth/register', [
            'nom' => 'Diop',
            'prenom' => 'Amadou',
            'email' => 'amadou.diop@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'telephone' => '+221771234567',
            'localisation' => 'Dakar, Plateau',
        ]);

        $registrationResponse->assertStatus(201)
            ->assertJsonStructure(['success', 'user', 'token']);

        $token = $registrationResponse->json('token');
        $userId = $registrationResponse->json('user.id');

        // Vérifier que l'utilisateur a été créé avec un code de parrainage
        $user = User::find($userId);
        $this->assertNotNull($user->code_parrainage);
        $this->assertEquals(0, $user->point_fidelite);
        $this->assertEquals(0, $user->solde);

        // ========================================
        // ÉTAPE 2: Recharge du solde
        // ========================================
        // Simuler une recharge de solde (normalement via CinetPay)
        $user->solde = 10000;
        $user->save();

        // ========================================
        // ÉTAPE 3: Consultation du menu
        // ========================================
        $categorie = CategorieMenu::create([
            'nom_categorie' => 'Plats',
            'description' => 'Plats principaux',
        ]);

        $menu1 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'description' => 'Riz au poisson',
            'prix' => 2500,
            'disponible' => 'oui',
            'temps_preparation' => 30,
        ]);

        $menu2 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Yassa Poulet',
            'description' => 'Poulet mariné aux oignons',
            'prix' => 2000,
            'disponible' => 'oui',
            'temps_preparation' => 25,
        ]);

        // Créer du stock
        Stock::create([
            'id_article' => $menu1->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        Stock::create([
            'id_article' => $menu2->id_article,
            'quantite_disponible' => 30,
            'seuil_alerte' => 10,
        ]);

        $menuResponse = $this->getJson('/api/menu');
        $menuResponse->assertStatus(200)
            ->assertJsonCount(2, 'data');

        // ========================================
        // ÉTAPE 4: Création d'une commande
        // ========================================
        $orderResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/commandes', [
                'type_livraison' => 'livraison',
                'adresse_livraison' => 'Dakar, Plateau, Rue 10',
                'heure_arrivee' => '13:00',
                'commentaire_client' => 'Pas trop épicé svp',
                'articles' => [
                    [
                        'id' => $menu1->id_article,
                        'prix' => 2500,
                        'quantite' => 2,
                    ],
                    [
                        'id' => $menu2->id_article,
                        'prix' => 2000,
                        'quantite' => 1,
                    ],
                ],
            ]);

        $orderResponse->assertStatus(201)
            ->assertJson(['success' => true]);

        $commandeId = $orderResponse->json('data.id_commande');

        // Vérifier que la commande a été créée
        $commande = Commande::find($commandeId);
        $this->assertNotNull($commande);
        $this->assertEquals(7000, $commande->montant_total);
        $this->assertEquals(7000, $commande->montant_final);
        $this->assertEquals('en_attente', $commande->statut_commande);

        // Vérifier que le stock a été décrémenté
        $stock1 = Stock::where('id_article', $menu1->id_article)->first();
        $this->assertEquals(48, $stock1->quantite_disponible); // 50 - 2

        $stock2 = Stock::where('id_article', $menu2->id_article)->first();
        $this->assertEquals(29, $stock2->quantite_disponible); // 30 - 1

        // Vérifier que le solde a été débité
        $user->refresh();
        $this->assertEquals(3000, $user->solde); // 10000 - 7000

        // Vérifier que l'utilisateur a gagné des points (7000 FCFA = 7 points)
        $this->assertEquals(7, $user->point_fidelite);

        // ========================================
        // ÉTAPE 5: Consultation de la commande
        // ========================================
        $viewOrderResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/commandes/{$commandeId}");

        $viewOrderResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id_commande' => $commandeId,
                    'statut_commande' => 'en_attente',
                ],
            ]);

        // ========================================
        // ÉTAPE 6: Le staff met à jour le statut (en préparation)
        // ========================================
        $staff = User::factory()->create(['role' => 'employe']);

        $updateStatusResponse = $this->actingAs($staff)
            ->putJson("/api/staff/commandes/{$commandeId}/status", [
                'statut' => 'en_preparation',
            ]);

        $updateStatusResponse->assertStatus(200);

        $commande->refresh();
        $this->assertEquals('en_preparation', $commande->statut_commande);

        // ========================================
        // ÉTAPE 7: Commande prête
        // ========================================
        $this->actingAs($staff)
            ->putJson("/api/staff/commandes/{$commandeId}/status", [
                'statut' => 'prete',
            ])
            ->assertStatus(200);

        $commande->refresh();
        $this->assertEquals('prete', $commande->statut_commande);

        // ========================================
        // ÉTAPE 8: Commande livrée
        // ========================================
        $this->actingAs($staff)
            ->putJson("/api/staff/commandes/{$commandeId}/status", [
                'statut' => 'livree',
            ])
            ->assertStatus(200);

        $commande->refresh();
        $this->assertEquals('livree', $commande->statut_commande);

        // ========================================
        // ÉTAPE 9: Vérification finale
        // ========================================
        // L'utilisateur consulte son historique de commandes
        $historyResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/commandes/mes-commandes');

        $historyResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment([
                'statut_commande' => 'livree',
            ]);

        // Vérifier le solde de points de fidélité
        $pointsResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/fidelite/solde');

        $pointsResponse->assertStatus(200)
            ->assertJsonFragment([
                'points' => 7,
            ]);
    }

    /** @test */
    public function complete_user_journey_with_loyalty_points_usage()
    {
        // ========================================
        // ÉTAPE 1: Créer un utilisateur avec des points
        // ========================================
        $user = User::factory()->create([
            'solde' => 10000,
            'point_fidelite' => 20,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        // ========================================
        // ÉTAPE 2: Créer le menu et le stock
        // ========================================
        $categorie = CategorieMenu::create([
            'nom_categorie' => 'Plats',
            'description' => 'Plats principaux',
        ]);

        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 3000,
            'disponible' => 'oui',
        ]);

        Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        // ========================================
        // ÉTAPE 3: Créer une commande en utilisant des points
        // ========================================
        $orderResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/commandes', [
                'type_livraison' => 'sur_place',
                'points_utilises' => 10, // 10 points = 1000 FCFA de réduction
                'articles' => [
                    [
                        'id' => $menu->id_article,
                        'prix' => 3000,
                        'quantite' => 1,
                    ],
                ],
            ]);

        $orderResponse->assertStatus(201);

        // ========================================
        // ÉTAPE 4: Vérifications
        // ========================================
        $user->refresh();

        // Montant total: 3000
        // Réduction: 1000 (10 points)
        // Montant final: 2000
        // Points gagnés: 2 (2000 / 1000)
        // Points finaux: 20 - 10 + 2 = 12

        $this->assertEquals(8000, $user->solde); // 10000 - 2000
        $this->assertEquals(12, $user->point_fidelite); // 20 - 10 + 2

        // Vérifier l'historique des points
        $historyResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/fidelite/historique');

        $historyResponse->assertStatus(200)
            ->assertJsonCount(2, 'data'); // Une entrée pour l'utilisation, une pour le gain
    }

    /** @test */
    public function user_journey_fails_with_insufficient_stock()
    {
        // ========================================
        // ÉTAPE 1: Créer un utilisateur
        // ========================================
        $user = User::factory()->create(['solde' => 10000]);
        $token = $user->createToken('test-token')->plainTextToken;

        // ========================================
        // ÉTAPE 2: Créer le menu avec stock limité
        // ========================================
        $categorie = CategorieMenu::create([
            'nom_categorie' => 'Plats',
            'description' => 'Plats principaux',
        ]);

        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 2, // Stock limité
            'seuil_alerte' => 10,
        ]);

        // ========================================
        // ÉTAPE 3: Tenter de commander plus que le stock disponible
        // ========================================
        $orderResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/commandes', [
                'type_livraison' => 'livraison',
                'adresse_livraison' => 'Dakar',
                'articles' => [
                    [
                        'id' => $menu->id_article,
                        'prix' => 2500,
                        'quantite' => 5, // Plus que le stock disponible
                    ],
                ],
            ]);

        $orderResponse->assertStatus(400)
            ->assertJson(['success' => false]);

        // Vérifier que le solde n'a pas été débité
        $user->refresh();
        $this->assertEquals(10000, $user->solde);

        // Vérifier que le stock n'a pas changé
        $stock = Stock::where('id_article', $menu->id_article)->first();
        $this->assertEquals(2, $stock->quantite_disponible);
    }
}
