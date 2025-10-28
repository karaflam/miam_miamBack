<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Stock;
use App\Models\Menu;
use App\Models\CategorieMenu;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class StockModelTest extends TestCase
{
    use DatabaseMigrations;

    /** @test */
    public function it_can_create_a_stock()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1000,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 100,
            'seuil_alerte' => 20,
        ]);

        $this->assertInstanceOf(Stock::class, $stock);
        $this->assertEquals(100, $stock->quantite_disponible);
        $this->assertEquals(20, $stock->seuil_alerte);
    }

    /** @test */
    public function it_belongs_to_article()
    {
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

        $this->assertInstanceOf(Menu::class, $stock->article);
        $this->assertEquals('Thiéboudienne', $stock->article->nom_article);
    }

    /** @test */
    public function it_can_decrement_stock()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1000,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 100,
            'seuil_alerte' => 20,
        ]);

        $stock->quantite_disponible -= 10;
        $stock->save();

        $this->assertEquals(90, $stock->fresh()->quantite_disponible);
    }

    /** @test */
    public function it_can_detect_low_stock()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1000,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 15,
            'seuil_alerte' => 20,
        ]);

        $this->assertTrue($stock->quantite_disponible < $stock->seuil_alerte);
    }

    /** @test */
    public function it_can_detect_out_of_stock()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1000,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => 0,
            'seuil_alerte' => 20,
        ]);

        $this->assertEquals(0, $stock->quantite_disponible);
        $this->assertTrue($stock->quantite_disponible <= 0);
    }

    /** @test */
    public function it_casts_quantites_to_integer()
    {
        $categorie = CategorieMenu::factory()->create();
        $menu = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Test Article',
            'prix' => 1000,
            'disponible' => 'oui',
        ]);

        $stock = Stock::create([
            'id_article' => $menu->id_article,
            'quantite_disponible' => '100',
            'seuil_alerte' => '20',
        ]);

        $this->assertIsInt($stock->quantite_disponible);
        $this->assertIsInt($stock->seuil_alerte);
    }
}
