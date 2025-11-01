<?php

namespace Tests\Feature\Api;

use App\Models\CategorieMenu;
use App\Models\Menu;
use App\Models\Employe;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $adminUser;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a category to be used by menu items
        $this->category = CategorieMenu::create([
            'nom_categorie' => 'Plats Chauds',
            'description' => 'Tous les plats chauds'
        ]);

        // Create an admin role
        $adminRole = Role::create(['nom_role' => 'Administrateur']);

        // Create an admin user (Employe)
        $this->adminUser = Employe::create([
            'nom' => 'Admin',
            'prenom' => 'Test',
            'email' => $this->faker->unique()->safeEmail,
            'mot_de_passe' => bcrypt('password'),
            'id_role' => $adminRole->id_role,
            'actif' => 'oui',
        ]);
    }

    public function test_anyone_can_fetch_menu_items()
    {
        Menu::factory()->count(3)->create(['id_categorie' => $this->category->id_categorie]);

        $response = $this->getJson('/api/menu');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data'); // Assuming the response is paginated or nested under 'data'
    }

    public function test_anyone_can_fetch_single_menu_item()
    {
        $menu = Menu::factory()->create(['id_categorie' => $this->category->id_categorie]);

        $response = $this->getJson('/api/menu/' . $menu->id_article);

        $response->assertStatus(200)
                 ->assertJsonFragment(['nom' => $menu->nom_article]);
    }

    public function test_unauthenticated_user_cannot_create_menu_item()
    {
        $menuData = [
            'nom_article' => 'Test Burger',
            'id_categorie' => $this->category->id_categorie,
            'prix' => 9.99,
            'description' => 'A delicious test burger'
        ];

        $this->postJson('/api/menu', $menuData)->assertStatus(401);
    }

    public function test_authenticated_admin_can_create_menu_item()
    {
        $menuData = [
            'nom_article' => 'Super Burger',
            'id_categorie' => $this->category->id_categorie,
            'prix' => 12.50,
            'description' => 'A super delicious burger'
        ];

        $response = $this->actingAs($this->adminUser)->postJson('/api/menu', $menuData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('menus', ['nom_article' => 'Super Burger']);
    }

    public function test_authenticated_admin_can_update_menu_item()
    {
        $menu = Menu::factory()->create(['id_categorie' => $this->category->id_categorie]);

        $updateData = [
            'nom_article' => 'Burger Deluxe',
            'id_categorie' => $this->category->id_categorie,
            'prix' => 15.00,
        ];

        $response = $this->actingAs($this->adminUser)->putJson('/api/menu/' . $menu->id_article, $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('menus', ['nom_article' => 'Burger Deluxe', 'prix' => 15.00]);
    }

    public function test_authenticated_admin_can_delete_menu_item()
    {
        $menu = Menu::factory()->create(['id_categorie' => $this->category->id_categorie]);

        $response = $this->actingAs($this->adminUser)->deleteJson('/api/menu/' . $menu->id_article);

        $response->assertStatus(200); // Or 200 with a success message
        $this->assertDatabaseMissing('menus', ['id_article' => $menu->id_article]);
    }
}