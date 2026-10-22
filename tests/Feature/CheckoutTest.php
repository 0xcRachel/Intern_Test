<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_checkout_and_is_enrolled_immediately(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $package = Package::factory()->create(['title' => 'Writing Task 2 Pro', 'price' => 40]);
        $second = Package::factory()->create(['title' => 'Listening Lab', 'price' => 20]);
        Coupon::create([
            'code' => 'IELTS10',
            'label' => 'Ten percent off',
            'type' => 'percent',
            'value' => 10,
            'is_active' => true,
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson('/api/checkout', [
            'package_ids' => [$package->id, $second->id],
            'coupon' => 'ielts10',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.subtotal', 60)
            ->assertJsonPath('data.discount', 6)
            ->assertJsonPath('data.total', 54)
            ->assertJsonPath('data.coupon_code', 'IELTS10')
            ->assertJsonCount(2, 'data.items');

        $this->assertDatabaseHas('orders', [
            'user_id' => $student->id,
            'status' => 'paid',
            'total' => 54,
        ]);
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'package_id' => $package->id,
        ]);
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'package_id' => $second->id,
        ]);
        $this->assertDatabaseHas('coupons', ['code' => 'IELTS10', 'used_count' => 1]);
    }

    public function test_quote_does_not_create_an_order_and_applies_discount(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $package = Package::factory()->create(['price' => 50]);
        Coupon::create([
            'code' => 'BAND8',
            'label' => 'Fifteen percent off',
            'type' => 'percent',
            'value' => 15,
            'is_active' => true,
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson('/api/checkout/quote', [
            'package_ids' => [$package->id],
            'coupon' => 'BAND8',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.subtotal', 50)
            ->assertJsonPath('data.discount', 7.5)
            ->assertJsonPath('data.total', 42.5);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('enrollments', 0);
    }

    public function test_student_cannot_buy_a_package_twice(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $package = Package::factory()->create(['price' => 30]);
        Enrollment::create([
            'user_id' => $student->id,
            'package_id' => $package->id,
            'enrolled_at' => now(),
        ]);

        Sanctum::actingAs($student);

        $this->postJson('/api/checkout', [
            'package_ids' => [$package->id],
        ])->assertStatus(422)
            ->assertJsonValidationErrors('package_ids');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_invalid_coupon_is_rejected(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $package = Package::factory()->create(['price' => 30]);

        Sanctum::actingAs($student);

        $this->postJson('/api/checkout', [
            'package_ids' => [$package->id],
            'coupon' => 'NOTREAL',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('coupon');
    }

    public function test_student_sees_own_orders_and_courses_only(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $other = User::factory()->create(['role' => 'student']);
        $package = Package::factory()->create(['title' => 'Reading Rescue', 'price' => 25]);

        $order = Order::create([
            'user_id' => $student->id,
            'code' => 'EP-TEST-0001',
            'status' => 'paid',
            'subtotal' => 25,
            'discount' => 0,
            'total' => 25,
            'currency' => 'USD',
            'paid_at' => now(),
        ]);
        $order->items()->create([
            'package_id' => $package->id,
            'package_title' => $package->title,
            'package_slug' => $package->slug,
            'price' => 25,
            'quantity' => 1,
        ]);
        Enrollment::create([
            'user_id' => $student->id,
            'package_id' => $package->id,
            'order_id' => $order->id,
            'enrolled_at' => now(),
        ]);

        Sanctum::actingAs($student);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.code', 'EP-TEST-0001');

        $this->getJson('/api/my/courses')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.title', 'Reading Rescue');

        $this->getJson("/api/orders/{$order->id}")->assertOk();

        Sanctum::actingAs($other);
        $this->getJson("/api/orders/{$order->id}")->assertForbidden();
        $this->getJson('/api/my/courses')->assertOk()->assertJsonPath('total', 0);
    }

    public function test_student_courses_are_paginated(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $packages = Package::factory()->count(13)->create();

        foreach ($packages as $package) {
            Enrollment::create([
                'user_id' => $student->id,
                'package_id' => $package->id,
                'enrolled_at' => now(),
            ]);
        }

        Sanctum::actingAs($student);

        $this->getJson('/api/my/courses?page=2&per_page=5')
            ->assertOk()
            ->assertJsonPath('total', 13)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.last_page', 3)
            ->assertJsonPath('meta.total', 13)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonCount(5, 'data');
    }

    public function test_admin_can_list_orders_and_dashboard_exposes_revenue(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student', 'name' => 'Lan Anh']);
        $package = Package::factory()->create(['price' => 30]);
        $order = Order::create([
            'user_id' => $student->id,
            'code' => 'EP-ADMIN-0001',
            'status' => 'paid',
            'subtotal' => 30,
            'discount' => 0,
            'total' => 30,
            'currency' => 'USD',
            'paid_at' => now(),
        ]);
        $order->items()->create([
            'package_id' => $package->id,
            'package_title' => $package->title,
            'package_slug' => $package->slug,
            'price' => 30,
            'quantity' => 1,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/orders')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('summary.revenue', 30)
            ->assertJsonPath('data.0.code', 'EP-ADMIN-0001');

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('metrics.revenue', 30)
            ->assertJsonPath('metrics.paid_orders', 1);
    }

    public function test_student_can_update_profile_fields(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);

        $this->patchJson('/api/profile', [
            'name' => 'Minh Anh',
            'target_band' => '8.0',
            'bio' => 'Learning IELTS every day.',
            'avatar' => 'https://example.com/avatar.png',
        ])->assertOk()
            ->assertJsonPath('user.name', 'Minh Anh')
            ->assertJsonPath('user.target_band', '8.0');

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'name' => 'Minh Anh',
            'target_band' => '8.0',
        ]);
    }
}
