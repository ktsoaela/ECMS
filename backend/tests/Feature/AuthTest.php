<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ada Lovelace',
            'email' => 'Ada@Example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('email', 'ada@example.com')
            ->assertJsonPath('name', 'Ada Lovelace')
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('users', ['email' => 'ada@example.com']);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'ada@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable()
            ->assertJsonPath('error', 'Invalid input')
            ->assertJsonPath('details.email', 'Email is already registered');
    }

    public function test_login_returns_a_token(): void
    {
        User::factory()->create([
            'email' => 'ada@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'ada@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('email', 'ada@example.com')
            ->assertJsonStructure(['token']);
    }

    public function test_login_rejects_a_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'ada@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'ada@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable()
            ->assertJsonPath('details.email', 'These credentials do not match our records');
    }

    public function test_campaigns_require_a_token(): void
    {
        $this->getJson('/api/campaigns')->assertUnauthorized();
    }

    public function test_logout_revokes_the_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('spa')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_logged_in_user_can_list_campaigns(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/campaigns')->assertOk()->assertJson([]);
    }
}
