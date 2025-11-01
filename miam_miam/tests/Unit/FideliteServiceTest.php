<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\FideliteService;
use App\Models\Commande;
use App\Models\User;
use App\Models\SuiviPoint;
use Mockery;

class FideliteServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * @test
     */
    public function attribuerPoints_calculates_and_assigns_correct_points()
    {
                                        // Mock User
                                        $user = Mockery::mock(User::class)->shouldAllowMockingProtectedMethods()->makePartial();
                                        $user->id_utilisateur = 1;
                                        $user->point_fidelite = 0; // Initial points
                                
                                        $user->shouldReceive('increment')
                                             ->once()
                                             ->with('point_fidelite', 10)
                                             ->andReturnUsing(function ($column, $amount) use ($user) {
                                                 $user->point_fidelite += $amount; // This should update the mock's property
                                             });        // Mock Commande
        $commande = Mockery::mock(Commande::class)->shouldAllowMockingProtectedMethods()->makePartial();
        $commande->id_commande = 100;
        $commande->montant_final = 10000; // 10 points
        $commande->utilisateur = $user; // Associate user with command

        // Mock SuiviPoint (static method)
        Mockery::mock('alias:' . SuiviPoint::class)
            ->shouldReceive('create')
            ->once(); // Just check that create was called

        $service = new FideliteService();
        $pointsGagnes = $service->attribuerPoints($commande);

        $this->assertEquals(10, $pointsGagnes);
        $this->assertEquals(10, $user->point_fidelite); // Verify user points updated
    }

    /**
     * @test
     */
    public function attribuerPoints_returns_zero_for_insufficient_amount()
    {
        // Mock User
        $user = Mockery::mock(User::class)->shouldAllowMockingProtectedMethods()->makePartial();
        $user->shouldReceive('getAttribute')
             ->with('id_utilisateur')
             ->andReturn(1);
        $user->shouldReceive('getAttribute')
             ->with('point_fidelite')
             ->andReturn(0); // Initial points

        $user->shouldNotReceive('increment'); // Should not increment for 0 points

        // Mock Commande
        $commande = Mockery::mock(Commande::class)->shouldAllowMockingProtectedMethods()->makePartial();
        $commande->id_commande = 101;
        $commande->montant_final = 999; // Less than 1000, so 0 points
        $commande->utilisateur = $user;

        // Mock SuiviPoint (static method)
        Mockery::mock('alias:' . SuiviPoint::class)
            ->shouldNotReceive('create'); // Should not create entry for 0 points

        $service = new FideliteService();
        $pointsGagnes = $service->attribuerPoints($commande);

        $this->assertEquals(0, $pointsGagnes);
        $this->assertEquals(0, $user->point_fidelite); // User points should remain 0
    }
}
