<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Menu;
use App\Models\CategorieMenu;
use App\Models\Stock;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class MenuModelTest extends TestCase
{
    use DatabaseMigrations;

    /** @test */
    public function it_can_create_a_menu()
    {
        $categorie = CategorieMenu::create([
            'nom_categorie' => 'Plats',
            'description' => 'Plats principaux',
        ]);

        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Thiéboudienne',
            'description' => 'Plat traditionnel sénégalais',
            'prix' => 2500,
            'disponible' => 'oui',
            'temps_preparation' => 30,
        ]);

        $this->assertInstanceOf(Menu::class, $menu);
        $this->assertEquals('Thiéboudienne', $menu->nom_article);
        $this->assertEquals(2500, $menu->prix);
    }

    /** @test */
    public function it_casts_prix_to_decimal()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1500.50,
            'disponible' => 'oui',
        ]);

        $this->assertEquals('1500.50', $menu->prix);
    }

    /** @test */
    public function it_has_categorie_relationship()
    {
        $categorie = CategorieMenu::factory()->create(['nom_categorie' => 'Boissons']);
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Jus de Bissap',
            'prix' => 500,
            'disponible' => 'oui',
        ]);

        $this->assertInstanceOf(CategorieMenu::class, $menu->categorie);
        $this->assertEquals('Boissons', $menu->categorie->nom_categorie);
    }

    /** @test */
    public function it_has_stock_relationship()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1000,
            'disponible' => 'oui',
        ]);

        Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 50,
            'seuil_alerte' => 10,
        ]);

        $this->assertInstanceOf(Stock::class, $menu->stock);
        $this->assertEquals(50, $menu->stock->quantite_disponible);
    }

    /** @test */
    public function it_can_scope_disponible_items()
    {
        $categorie = CategorieMenu::factory()->create();
        
        Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Article Disponible',
            'prix' => 1000,
            'disponible' => 'oui',
        ]);

        Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Article Indisponible',
            'prix' => 1000,
            'disponible' => 'non',
        ]);

        $disponibles = Menu::disponible()->get();
        
        $this->assertEquals(1, $disponibles->count());
        $this->assertEquals('Article Disponible', $disponibles->first()->nom_article);
    }

    /** @test */
    public function it_casts_temps_preparation_to_integer()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1000,
            'disponible' => 'oui',
            'temps_preparation' => '25',
        ]);

        $this->assertIsInt($menu->temps_preparation);
        $this->assertEquals(25, $menu->temps_preparation);
    }
}
