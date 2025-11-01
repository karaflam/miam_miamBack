<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test user registration via API.
     *
     * @return void
     */
    public function test_user_can_register_via_api()
    {
        $userData = [
            'nom' => $this->faker->lastName(),
            'prenom' => $this->faker->firstName(),
            'email' => $this->faker->unique()->safeEmail(),
            'telephone' => $this->faker->unique()->numerify('##########'),
            'localisation' => $this->faker->address(),
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201) // Assuming 201 Created for successful registration
                 ->assertJsonStructure([
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role',
                         'balance',
                         'loyaltyPoints',
                     ],
                     'token',
                 ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'nom' => $userData['nom'],
            'prenom' => $userData['prenom'],
            'telephone' => $userData['telephone'],
        ]);
    }

    /**
     * Test user login via API.
     *
     * @return void
     */
    public function test_user_can_login_via_api()
    {
        $password = 'Password123';
        $user = User::factory()->create([
            'mot_de_passe' => Hash::make($password),
        ]);

        $credentials = [
            'email' => $user->email,
            'password' => $password,
        ];

        $response = $this->postJson('/api/auth/login', $credentials);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role',
                         'balance',
                         'loyaltyPoints',
                     ],
                     'token',
                 ]);

        // Verify that the user is actually authenticated (optional, but good practice)
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test user cannot login with invalid credentials.
     *
     * @return void
     */
    public function test_user_cannot_login_with_invalid_credentials()
    {
        $user = User::factory()->create();

        $credentials = [
            'email' => $user->email,
            'password' => 'wrong-password',
        ];

        $response = $this->postJson('/api/auth/login', $credentials);

        $response->assertStatus(422) // Unprocessable Entity for validation errors
                 ->assertJson(['message' => "Les informations d'identification fournies sont incorrectes."]);

        $this->assertGuest();
    }

    /**
     * Test user logout via API.
     *
     * @return void
     */
    public function test_user_can_logout_via_api()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id_utilisateur,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200)
                 ->assertJson(['success' => true, 'message' => 'Déconnexion réussie']);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id_utilisateur,
        ]);
    }
}
