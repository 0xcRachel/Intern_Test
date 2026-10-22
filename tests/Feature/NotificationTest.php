<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use App\Notifications\OrderActivatedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_realtime_notifications_for_student_and_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);
        $package = Package::factory()->create(['price' => 30]);

        Sanctum::actingAs($student);

        $this->postJson('/api/checkout', ['package_ids' => [$package->id]])
            ->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $student->id,
            'type' => OrderActivatedNotification::class,
        ]);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $admin->id,
            'type' => OrderActivatedNotification::class,
        ]);

        $response = $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.title', 'Khóa học đã được kích hoạt');

        $notificationId = $response->json('data.0.id');

        $this->patchJson("/api/notifications/{$notificationId}/read")
            ->assertOk();

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);
    }
}
