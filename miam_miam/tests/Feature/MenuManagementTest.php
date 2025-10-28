<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Menu;
use App\Models\CategorieMenu;
use App\Models\Stock;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MenuManagementTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function anyone_can_view_available_menus()
    {
        $categorie = CategorieMenu::factory()->create();
        
        Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Yassa Poulet',
            'prix' => 2000,
            'disponible' => 'non',
        ]);

        $response = $this->getJson('/api/menu');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function anyone_can_view_single_menu()
    {
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'description' => 'Plat traditionnel',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $response = $this->getJson("/api/menu/{$menu->id_article}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'nom_article' => 'Thiéboudienne',
                'prix' => '2500.00',
            ]);
    }

    /** @test */
    public function staff_can_create_menu()
    {
        $staff = User::factory()->create(['role' => 'employe']);
        $categorie = CategorieMenu::factory()->create();

        $response = $this->actingAs($staff)->postJson('/api/menu', [
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Mafé Poulet',
            'description' => 'Poulet à la sauce d\'arachide',
            'prix' => 2200,
            'disponible' => 'oui',
            'temps_preparation' => 25,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('menus', [
            'nom_article' => 'Mafé Poulet',
            'prix' => 2200,
        ]);
    }

    /** @test */
    public function regular_user_cannot_create_menu()
    {
        $user = User::factory()->create(['role' => 'student']);
        $categorie = CategorieMenu::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/menu', [
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Mafé Poulet',
            'prix' => 2200,
            'disponible' => 'oui',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function staff_can_update_menu()
    {
        $staff = User::factory()->create(['role' => 'admin']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $response = $this->actingAs($staff)->putJson("/api/menu/{$menu->id_article}", [
            'nom_article' => 'Thiéboudienne Royale',
            'prix' => 3000,
            'disponible' => 'oui',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('menus', [
            'id_article' => $menu->id_article,
            'nom_article' => 'Thiéboudienne Royale',
            'prix' => 3000,
        ]);
    }

    /** @test */
    public function staff_can_delete_menu()
    {
        $staff = User::factory()->create(['role' => 'admin']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $response = $this->actingAs($staff)->deleteJson("/api/menu/{$menu->id_article}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('menus', [
            'id_article' => $menu->id_article,
        ]);
    }

    /** @test */
    public function staff_can_toggle_menu_availability()
    {
        $staff = User::factory()->create(['role' => 'employe']);
        $categorie = CategorieMenu::factory()->create();
        
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'prix' => 2500,
            'disponible' => 'oui',
        ]);

        $response = $this->actingAs($staff)->postJson("/api/menu/{$menu->id_article}/toggle-disponibilite");

        $response->assertStatus(200);

        $this->assertDatabaseHas('menus', [
            'id_article' => $menu->id_article,
            'disponible' => 'non',
        ]);
    }

    /** @test */
    public function anyone_can_view_categories()
    {
        CategorieMenu::create([
            'nom_categorie' => 'Plats',
            'description' => 'Plats principaux',
        ]);

        CategorieMenu::create([
            'nom_categorie' => 'Boissons',
            'description' => 'Boissons fraîches',
        ]);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
