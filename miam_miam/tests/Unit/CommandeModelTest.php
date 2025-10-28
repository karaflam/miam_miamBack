<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Commande;
use App\Models\User;
use App\Models\DetailCommande;
use App\Models\Menu;
use App\Models\CategorieMenu;
use App\Models\Paiement;
use App\Models\Reclamation;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class CommandeModelTest extends TestCase
{
    use DatabaseMigrations;

    /** @test */
    public function it_can_create_a_commande()
    {
        $user = User::factory()->create();

        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'adresse_livraison' => '123 Rue de Dakar',
            'statut_commande' => 'en_attente',
            'montant_total' => 5000,
            'montant_remise' => 500,
            'montant_final' => 4500,
            'points_utilises' => 5,
        ]);

        $this->assertInstanceOf(Commande::class, $commande);
        $this->assertEquals('livraison', $commande->type_livraison);
        $this->assertEquals(5000, $commande->montant_total);
    }

    /** @test */
    public function it_belongs_to_utilisateur()
    {
        $user = User::factory()->create(['nom' => 'Diop', 'prenom' => 'Amadou']);
        
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'sur_place',
            'montant_total' => 3000,
            'montant_final' => 3000,
            'statut_commande' => 'en_attente',
        ]);

        $this->assertInstanceOf(User::class, $commande->utilisateur);
        $this->assertEquals('Diop', $commande->utilisateur->nom);
    }

    /** @test */
    public function it_has_many_details()
    {
        $user = User::factory()->create();
        $categorie = CategorieMenu::factory()->create();
        $menu1 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Plat 1',
            'prix' => 2000,
            'disponible' => 'oui',
        ]);
        $menu2 = Menu::create([
            'id_categorie' => $categorie->id_categorie,
            'nom_article' => 'Plat 2',
            'prix' => 1500,
            'disponible' => 'oui',
        ]);

        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 3500,
            'montant_final' => 3500,
            'statut_commande' => 'en_attente',
        ]);

        DetailCommande::create([
            'id_commande' => $commande->id_commande,
            'id_article' => $menu1->id_article,
            'prix_unitaire' => 2000,
            'quantite' => 1,
        ]);

        DetailCommande::create([
            'id_commande' => $commande->id_commande,
            'id_article' => $menu2->id_article,
            'prix_unitaire' => 1500,
            'quantite' => 1,
        ]);

        $this->assertEquals(2, $commande->details->count());
    }

    /** @test */
    public function it_casts_montants_to_decimal()
    {
        $user = User::factory()->create();
        
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000.75,
            'montant_remise' => 500.25,
            'montant_final' => 4500.50,
            'statut_commande' => 'en_attente',
        ]);

        $this->assertEquals('5000.75', $commande->montant_total);
        $this->assertEquals('500.25', $commande->montant_remise);
        $this->assertEquals('4500.50', $commande->montant_final);
    }

    /** @test */
    public function it_has_many_paiements()
    {
        $user = User::factory()->create();
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'en_attente',
        ]);

        Paiement::create([
            'id_commande' => $commande->id_commande,
            'id_utilisateur' => $user->id_utilisateur,
            'montant' => 5000,
            'methode_paiement' => 'carte',
            'statut_paiement' => 'reussi',
        ]);

        $this->assertEquals(1, $commande->paiements->count());
    }

    /** @test */
    public function it_has_many_reclamations()
    {
        $user = User::factory()->create();
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'livree',
        ]);

        Reclamation::create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_commande' => $commande->id_commande,
            'type_reclamation' => 'qualite',
            'description' => 'Plat froid',
            'statut_reclamation' => 'en_attente',
        ]);

        $this->assertEquals(1, $commande->reclamations->count());
    }

    /** @test */
    public function it_casts_points_utilises_to_integer()
    {
        $user = User::factory()->create();
        
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 4500,
            'points_utilises' => '5',
            'statut_commande' => 'en_attente',
        ]);

        $this->assertIsInt($commande->points_utilises);
        $this->assertEquals(5, $commande->points_utilises);
    }
}
