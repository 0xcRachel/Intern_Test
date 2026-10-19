<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_admin_route(): void
    {
        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(401);
    }

    public function test_student_gets_403_on_admin_route(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        Sanctum::actingAs($student);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_gets_200_on_admin_route(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Welcome Admin',
            ]);
    }
}
