<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_providers_endpoint_reports_configuration_state(): void
    {
        $this->getJson('/api/auth/providers')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'google' => ['configured'],
                    'github' => ['configured'],
                ],
            ]);
    }

    public function test_oauth_exchange_code_can_only_be_used_once(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        Cache::put('oauth_login:test-code', [
            'token' => 'plain-text-token',
            'user' => $user,
        ], now()->addMinutes(3));

        $this->postJson('/api/auth/oauth/exchange', ['code' => 'test-code'])
            ->assertOk()
            ->assertJsonPath('token', 'plain-text-token')
            ->assertJsonPath('user.email', $user->email);

        $this->postJson('/api/auth/oauth/exchange', ['code' => 'test-code'])
            ->assertStatus(422);
    }

    public function test_unknown_oauth_provider_redirects_to_login_with_error(): void
    {
        $response = $this->get('/api/auth/facebook/redirect');

        $response->assertRedirect();
        $this->assertStringContainsString('oauth_error=', $response->headers->get('Location'));
        $this->assertStringContainsString('/login?', $response->headers->get('Location'));
    }

    public function test_oauth_redirect_fails_friendly_when_not_configured(): void
    {
        config([
            'services.google.client_id' => null,
            'services.google.client_secret' => null,
        ]);

        $response = $this->get('/api/auth/google/redirect');

        $response->assertRedirect();
        $this->assertStringContainsString('oauth_error=', $response->headers->get('Location'));
    }
}
