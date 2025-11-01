<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Menu;
use App\Models\CategorieMenu;
use App\Models\Stock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CommandeTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $student;
    protected $menuItem1;
    protected $menuItem2;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an authenticated student with sufficient balance and points
        $this->student = User::factory()->create([
            'solde' => 100000, // Set a high balance
            'point_fidelite' => 1000, // Set some points, though not used in this test
        ]);

        // Create menu items to be ordered
        $category = CategorieMenu::factory()->create();
        $this->menuItem1 = Menu::factory()->create([
            'id_categorie' => $category->id_categorie,
            'prix' => 10.00,
        ]);
        // Create stock for menuItem1
        $stock1 = new Stock();
        $stock1->id_article = $this->menuItem1->id_article;
        $stock1->quantite_disponible = 100;
        $stock1->seuil_alerte = 10;
        $stock1->save();

        $this->menuItem2 = Menu::factory()->create([
            'id_categorie' => $category->id_categorie,
            'prix' => 5.50,
        ]);
        // Create stock for menuItem2
        $stock2 = new Stock();
        $stock2->id_article = $this->menuItem2->id_article;
        $stock2->quantite_disponible = 100;
        $stock2->seuil_alerte = 10;
        $stock2->save();
    }

    /**
     * @test
     */
    public function authenticated_student_can_create_an_order()
    {
        $orderPayload = [
            'articles' => [
                ['id' => $this->menuItem1->id_article, 'quantite' => 2, 'prix' => $this->menuItem1->prix], // 2 * 10.00 = 20.00
                ['id' => $this->menuItem2->id_article, 'quantite' => 1, 'prix' => $this->menuItem2->prix], // 1 * 5.50 = 5.50
            ],
            'type_livraison' => 'sur_place',
            'heure_arrivee' => now()->addHour()->format('H:i'),
        ];

        $response = $this->actingAs($this->student, 'sanctum') // Use the sanctum guard for API authentication
                         ->postJson('/api/commandes', $orderPayload);

        $response->assertStatus(201)
                 ->assertJsonStructure(['success', 'message', 'data' => ['id']]);

        $this->assertDatabaseHas('commandes', [
            'id_utilisateur' => $this->student->id_utilisateur,
            'montant_total' => 25.50, // 20.00 + 5.50
            'statut_commande' => 'en_attente',
        ]);

        $this->assertDatabaseHas('details_commandes', [
            'id_article' => $this->menuItem1->id_article,
            'quantite' => 2,
            'prix_unitaire' => 10.00,
        ]);

        $this->assertDatabaseHas('details_commandes', [
            'id_article' => $this->menuItem2->id_article,
            'quantite' => 1,
            'prix_unitaire' => 5.50,
        ]);
    }
}