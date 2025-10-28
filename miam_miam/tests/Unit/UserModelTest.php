<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Commande;
use App\Models\SuiviPoint;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class UserModelTest extends TestCase
{
    use DatabaseMigrations;

    /** @test */
    public function it_can_create_a_user()
    {
        $user = User::create([
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'john.doe@example.com',
            'mot_de_passe' => bcrypt('password123'),
            'telephone' => '+221771234567',
            'localisation' => 'Dakar',
            'code_parrainage' => 'ABC12345',
            'point_fidelite' => 0,
            'solde' => 0,
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Doe', $user->nom);
        $this->assertEquals('John', $user->prenom);
        $this->assertEquals('john.doe@example.com', $user->email);
    }

    /** @test */
    public function it_hides_password_in_array()
    {
        $user = User::create([
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'john.doe@example.com',
            'mot_de_passe' => bcrypt('password123'),
            'telephone' => '+221771234567',
            'localisation' => 'Dakar',
            'code_parrainage' => 'ABC12345',
        ]);

        $userArray = $user->toArray();
        $this->assertArrayNotHasKey('mot_de_passe', $userArray);
    }

    /** @test */
    public function it_has_commandes_relationship()
    {
        $user = User::factory()->create();
        
        $commande = Commande::create([
            'id_utilisateur' => $user->id_utilisateur,
            'type_livraison' => 'livraison',
            'montant_total' => 5000,
            'montant_final' => 5000,
            'statut_commande' => 'en_attente',
        ]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $user->commandes);
        $this->assertEquals(1, $user->commandes->count());
        $this->assertEquals($commande->id_commande, $user->commandes->first()->id_commande);
    }

    /** @test */
    public function it_has_parrain_relationship()
    {
        $parrain = User::factory()->create(['code_parrainage' => 'PARRAIN01']);
        $filleul = User::factory()->create(['id_parrain' => $parrain->id_utilisateur]);

        $this->assertInstanceOf(User::class, $filleul->parrain);
        $this->assertEquals($parrain->id_utilisateur, $filleul->parrain->id_utilisateur);
    }

    /** @test */
    public function it_has_filleuls_relationship()
    {
        $parrain = User::factory()->create(['code_parrainage' => 'PARRAIN01']);
        $filleul1 = User::factory()->create(['id_parrain' => $parrain->id_utilisateur]);
        $filleul2 = User::factory()->create(['id_parrain' => $parrain->id_utilisateur]);

        $this->assertEquals(2, $parrain->filleuls->count());
    }

    /** @test */
    public function it_casts_point_fidelite_to_integer()
    {
        $user = User::factory()->create(['point_fidelite' => '100']);
        
        $this->assertIsInt($user->point_fidelite);
        $this->assertEquals(100, $user->point_fidelite);
    }

    /** @test */
    public function it_casts_solde_to_decimal()
    {
        $user = User::factory()->create(['solde' => 5000.50]);
        
        $this->assertEquals('5000.50', $user->solde);
    }

    /** @test */
    public function it_has_suivi_points_relationship()
    {
        $user = User::factory()->create();
        
        SuiviPoint::create([
            'id_utilisateur' => $user->id_utilisateur,
            'variation_points' => 10,
            'solde_apres' => 10,
            'source_points' => 'achat',
        ]);

        $this->assertEquals(1, $user->suiviPoints->count());
    }
}
