<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Diop',
            'prenom' => 'Amadou',
            'email' => 'amadou.diop@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'telephone' => '+221771234567',
            'localisation' => 'Dakar',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'user' => ['id', 'name', 'email', 'role', 'balance', 'loyaltyPoints'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'amadou.diop@example.com',
            'nom' => 'Diop',
            'prenom' => 'Amadou',
        ]);
    }

    /** @test */
    public function user_can_register_with_referral_code()
    {
        $parrain = User::factory()->create([
            'code_parrainage' => 'PARRAIN01',
            'point_fidelite' => 0,
        ]);

        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Sow',
            'prenom' => 'Fatou',
            'email' => 'fatou.sow@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'telephone' => '+221771234568',
            'localisation' => 'Dakar',
            'code_parrain' => 'PARRAIN01',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'email' => 'fatou.sow@example.com',
            'id_parrain' => $parrain->id_utilisateur,
        ]);

        // Vérifier que le parrain a reçu des points
        $this->assertEquals(10, $parrain->fresh()->point_fidelite);
    }

    /** @test */
    public function registration_fails_with_invalid_referral_code()
    {
        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Sow',
            'prenom' => 'Fatou',
            'email' => 'fatou.sow@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'telephone' => '+221771234568',
            'localisation' => 'Dakar',
            'code_parrain' => 'INVALID123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code_parrain']);
    }

    /** @test */
    public function registration_fails_with_duplicate_email()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Diop',
            'prenom' => 'Amadou',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'telephone' => '+221771234567',
            'localisation' => 'Dakar',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function registration_fails_with_mismatched_passwords()
    {
        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Diop',
            'prenom' => 'Amadou',
            'email' => 'amadou.diop@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword123!',
            'telephone' => '+221771234567',
            'localisation' => 'Dakar',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'mot_de_passe' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'user' => ['id', 'name', 'email', 'role', 'balance', 'loyaltyPoints'],
                'token',
            ]);
    }

    /** @test */
    public function login_fails_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'mot_de_passe' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function login_fails_with_nonexistent_email()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Déconnexion réussie',
            ]);

        // Vérifier que le token a été supprimé
        $this->assertCount(0, $user->tokens);
    }

    /** @test */
    public function authenticated_user_can_get_their_profile()
    {
        $user = User::factory()->create([
            'nom' => 'Diop',
            'prenom' => 'Amadou',
            'email' => 'amadou@example.com',
            'solde' => 5000,
            'point_fidelite' => 50,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/auth/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'id' => $user->id_utilisateur,
                    'name' => 'Diop Amadou',
                    'email' => 'amadou@example.com',
                    'balance' => 5000,
                    'loyaltyPoints' => 50,
                ],
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/auth/user');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_receives_unique_referral_code_on_registration()
    {
        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Diop',
            'prenom' => 'Amadou',
            'email' => 'amadou.diop@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'telephone' => '+221771234567',
            'localisation' => 'Dakar',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'amadou.diop@example.com')->first();
        $this->assertNotNull($user->code_parrainage);
        $this->assertEquals(8, strlen($user->code_parrainage));
    }
}
