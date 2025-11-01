<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test that an unauthenticated user cannot access profile endpoints.
     *
     * @return void
     */
    public function test_unauthenticated_user_cannot_access_profile()
    {
        $this->getJson('/api/profile')->assertStatus(401);
        $this->putJson('/api/profile')->assertStatus(401);
    }

    /**
     * Test that an authenticated user can fetch their profile data.
     *
     * @return void
     */
    public function test_authenticated_user_can_fetch_profile()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/profile');

        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'id' => $user->id_utilisateur,
                         'nom' => $user->nom,
                         'prenom' => $user->prenom,
                         'email' => $user->email,
                     ]
                 ]);
    }

    /**
     * Test that an authenticated user can update their profile.
     *
     * @return void
     */
    public function test_authenticated_user_can_update_profile()
    {
        $user = User::factory()->create();

        $updateData = [
            'nom' => 'NouveauNom',
            'prenom' => $user->prenom, // prenom is required
            'email' => $user->email, // email is required
            'localisation' => 'Nouvelle Adresse, 123',
        ];

        $response = $this->actingAs($user)->putJson('/api/profile', $updateData);

        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                        'nom' => 'NouveauNom',
                        'localisation' => 'Nouvelle Adresse, 123',
                     ]
                 ]);

        $this->assertDatabaseHas('users', [
            'id_utilisateur' => $user->id_utilisateur,
            'nom' => 'NouveauNom',
            'localisation' => 'Nouvelle Adresse, 123',
        ]);
    }
}