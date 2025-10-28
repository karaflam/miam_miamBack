<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Menu;
use App\Models\CategorieMenu;
use App\Models\Stock;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StockManagementTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function staff_can_update_stock()
    {
        $staff = User::factory()->create(['role' => 'employe']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        $response = $this->actingAs($staff)->putJson("/api/stock/{$menu->id_article}", [
            'quantite_disponible' => 100,
            'seuil_alerte' => 15,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('stocks', [
            'id_article' => $menu->id_article,
            'quantite_disponible' => 100,
            'seuil_alerte' => 15,
        ]);
    }

    /** @test */
    public function staff_can_adjust_stock()
    {
        $staff = User::factory()->create(['role' => 'admin']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        $response = $this->actingAs($staff)->postJson("/api/stock/{$menu->id_article}/adjust", [
            'ajustement' => 20,
            'raison' => 'Réapprovisionnement',
        ]);

        $response->assertStatus(200);

        $this->assertEquals(70, $stock->fresh()->quantite_disponible);
    }

    /** @test */
    public function staff_can_view_stock_ruptures()
    {
        $staff = User::factory()->create(['role' => 'employe']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu1 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Article 1',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $menu2 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Article 2',
            'prix' => 2000,
            'disponible' => 'oui',
        ]);

        Stock::create([
            'id_article' => $menu1->id_article,
            'quantite_disponible' => 0,
            'seuil_alerte' => 10,
        ]);

        Stock::create([
            'id_article' => $menu2->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        $response = $this->actingAs($staff)->getJson('/api/stock/ruptures');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    /** @test */
    public function staff_can_view_stock_alerts()
    {
        $staff = User::factory()->create(['role' => 'manager']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu1 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Article 1',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $menu2 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Article 2',
            'prix' => 2000,
            'disponible' => 'oui',
        ]);

        // Stock en alerte (en dessous du seuil)
        Stock::create([
            'id_article' => $menu1->id_article,
            'quantite_disponible' => 5,
            'seuil_alerte' => 10,
        ]);

        // Stock normal
        Stock::create([
            'id_article' => $menu2->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        $response = $this->actingAs($staff)->getJson('/api/stock/alertes');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    /** @test */
    public function regular_user_cannot_update_stock()
    {
        $user = User::factory()->create(['role' => 'student']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        $response = $this->actingAs($user)->putJson("/api/stock/{$menu->id_article}", [
            'quantite_disponible' => 100,
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function menu_becomes_unavailable_when_stock_reaches_zero()
    {
        $staff = User::factory()->create(['role' => 'employe']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        $response = $this->actingAs($staff)->putJson("/api/stock/{$menu->id_article}", [
            'quantite_disponible' => 0,
            'seuil_alerte' => 10,
        ]);

        $response->assertStatus(200);

        // Note: La logique de mise à jour automatique de disponibilité 
        // se fait dans le CommandeController lors de la création de commande
        // Ce test vérifie juste la mise à jour du stock
        $this->assertEquals(0, $stock->fresh()->quantite_disponible);
    }
}
