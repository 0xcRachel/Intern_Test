<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Student',
            'email' => 'new.student@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('user.name', 'New Student')
            ->assertJsonPath('user.email', 'new.student@example.com')
            ->assertJsonPath('user.role', 'student')
            ->assertJsonStructure(['token', 'access_token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertNotEmpty($response->json('token'));

        $user = User::where('email', 'new.student@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertSame('student', $user->role);
    }

    public function test_registration_cannot_create_an_admin(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Sneaky User',
            'email' => 'sneaky@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'student');

        $this->assertDatabaseHas('users', [
            'email' => 'sneaky@example.com',
            'role' => 'student',
        ]);
    }

    public function test_registration_rejects_a_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Second User',
            'email' => 'Existing@Example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'No Confirmation',
            'email' => 'no-confirmation@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
