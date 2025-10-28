<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Menu;
use App\Models\CategorieMenu;
use App\Models\Stock;
use App\Models\Commande;
use App\Models\DetailCommande;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CommandeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer une catégorie et des menus pour les tests
        $this->categorie = CategorieMenu::create([
            'nom_categorie' => 'Plats',
            'description' => 'Plats principaux',
        ]);

        $this->menu1 = Menu::create([
            'id_categorie' => $this->categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $this->menu2 = Menu::create([
            'id_categorie' => $this->categorie->id_categorie,
            'nom_article' => 'Yassa Poulet',
            'prix' => 2000,
            'disponible' => 'oui',
        ]);

        // Créer du stock pour les menus
        Stock::create([
            'id_article' => $this->menu1->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        Stock::create([
            'id_article' => $this->menu2->id_article,
            'quantite_disponible' => 30,
            'seuil_alerte' => 10,
        ]);
    }

    /** @test */
    public function authenticated_user_can_create_order()
    {
        $user = User::factory()->create(['solde' => 10000]);

        $response = $this->actingAs($user)->postJson('/api/commandes', [
            'type_livraison' => 'livraison',
            'adresse_livraison' => '123 Rue de Dakar',
            'heure_arrivee' => '12:30',
            'commentaire_client' => 'Pas trop épicé',
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 2,
                ],
                [
                    'id' => $this->menu2->id_article,
                    'prix' => 2000,
                    'quantite' => 1,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Commande créée avec succès',
            ]);

        $this->assertDatabaseHas('commandes', [
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 7000,
        ]);

        $this->assertDatabaseHas('detail_commandes', [
            'id_article' => $this->menu1->id_article,
            'quantite' => 2,
        ]);
    }

    /** @test */
    public function order_creation_decrements_stock()
    {
        $user = User::factory()->create(['solde' => 10000]);

        $initialStock = Stock::where('id_article', $this->menu1->id_article)->first()->quantite_disponible;

        $response = $this->actingAs($user)->postJson('/api/commandes', [
            'type_livraison' => 'sur_place',
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 3,
                ],
            ],
        ]);

        $response->assertStatus(201);

        $newStock = Stock::where('id_article', $this->menu1->id_article)->first()->quantite_disponible;
        $this->assertEquals($initialStock - 3, $newStock);
    }

    /** @test */
    public function order_creation_fails_with_insufficient_stock()
    {
        $user = User::factory()->create(['solde' => 10000]);

        $response = $this->actingAs($user)->postJson('/api/commandes', [
            'type_livraison' => 'livraison',
            'adresse_livraison' => '123 Rue de Dakar',
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 100, // Plus que le stock disponible
                ],
            ],
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    /** @test */
    public function order_creation_fails_with_insufficient_balance()
    {
        $user = User::factory()->create(['solde' => 1000]); // Solde insuffisant

        $response = $this->actingAs($user)->postJson('/api/commandes', [
            'type_livraison' => 'livraison',
            'adresse_livraison' => '123 Rue de Dakar',
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 2,
                ],
            ],
        ]);

        $response->assertStatus(400)
            ->assertJsonFragment(['success' => false]);
    }

    /** @test */
    public function order_creation_with_loyalty_points()
    {
        $user = User::factory()->create([
            'solde' => 10000,
            'point_fidelite' => 20,
        ]);

        $response = $this->actingAs($user)->postJson('/api/commandes', [
            'type_livraison' => 'livraison',
            'adresse_livraison' => '123 Rue de Dakar',
            'points_utilises' => 10, // 10 points = 1000 FCFA de réduction
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('commandes', [
            'id_utilisateur' => $user->id_utilisateur,
            'montant_total' => 5000,
            'montant_remise' => 1000,
            'montant_final' => 4000,
            'points_utilises' => 10,
        ]);

        // Vérifier que les points ont été débités
        $this->assertEquals(10, $user->fresh()->point_fidelite);
    }

    /** @test */
    public function order_creation_earns_loyalty_points()
    {
        $user = User::factory()->create([
            'solde' => 10000,
            'point_fidelite' => 0,
        ]);

        $response = $this->actingAs($user)->postJson('/api/commandes', [
            'type_livraison' => 'livraison',
            'adresse_livraison' => '123 Rue de Dakar',
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201);

        // 5000 FCFA = 5 points (1000 FCFA = 1 point)
        $this->assertEquals(5, $user->fresh()->point_fidelite);
    }

    /** @test */
    public function order_creation_fails_with_insufficient_loyalty_points()
    {
        $user = User::factory()->create([
            'solde' => 10000,
            'point_fidelite' => 5,
        ]);

        $response = $this->actingAs($user)->postJson('/api/commandes', [
            'type_livraison' => 'livraison',
            'adresse_livraison' => '123 Rue de Dakar',
            'points_utilises' => 10, // Plus que les points disponibles
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 2,
                ],
            ],
        ]);

        $response->assertStatus(400)
            ->assertJsonFragment(['success' => false]);
    }

    /** @test */
    public function user_can_view_their_orders()
    {
        $user = User::factory()->create();
        
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'en_attente',
        ]);

        $response = $this->actingAs($user)->getJson('/api/commandes/mes-commandes');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(1, 'data');
    }

    /** @test */
    public function user_can_view_single_order()
    {
        $user = User::factory()->create();
        
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'en_attente',
        ]);

        $response = $this->actingAs($user)->getJson("/api/commandes/{$commande->id_commande}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    /** @test */
    public function user_cannot_view_other_users_orders()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $commande = Commande::create([
            'id_utilisateur' => $user2->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'en_attente',
        ]);

        $response = $this->actingAs($user1)->getJson("/api/commandes/{$commande->id_commande}");

        $response->assertStatus(404);
    }

    /** @test */
    public function staff_can_view_all_orders()
    {
        $staff = User::factory()->create(['role' => 'employe']);
        $user = User::factory()->create();
        
        Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'en_attente',
        ]);

        $response = $this->actingAs($staff)->getJson('/api/staff/commandes');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    /** @test */
    public function staff_can_update_order_status()
    {
        $staff = User::factory()->create(['role' => 'employe']);
        $user = User::factory()->create();
        
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'en_attente',
        ]);

        $response = $this->actingAs($staff)->putJson("/api/staff/commandes/{$commande->id_commande}/status", [
            'statut' => 'en_preparation',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('commandes', [
            'id_commande' => $commande->id_commande,
            'statut_commande' => 'en_preparation',
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_order()
    {
        $response = $this->postJson('/api/commandes', [
            'type_livraison' => 'livraison',
            'articles' => [
                [
                    'id' => $this->menu1->id_article,
                    'prix' => 2500,
                    'quantite' => 1,
                ],
            ],
        ]);

        $response->assertStatus(401);
    }
}
