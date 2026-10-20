<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommerceDemoSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::updateOrCreate(
            ['code' => 'IELTS10'],
            [
                'label' => 'Giảm 10% cho học viên mới',
                'type' => 'percent',
                'value' => 10,
                'is_active' => true,
                'expires_at' => now()->addYear(),
                'usage_limit' => 500,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'BAND8'],
            [
                'label' => 'Ưu đãi Band 8.0+',
                'type' => 'percent',
                'value' => 15,
                'is_active' => true,
                'expires_at' => now()->addMonths(6),
                'usage_limit' => 100,
            ]
        );

        $student = User::where('email', 'student@example.com')->first();
        if (! $student) {
            return;
        }

        $packages = Package::where('is_active', true)
            ->whereNotIn('id', Enrollment::where('user_id', $student->id)->pluck('package_id'))
            ->orderBy('id')
            ->limit(2)
            ->get();

        if ($packages->isEmpty()) {
            return;
        }

        $subtotal = round((float) $packages->sum('price'), 2);

        $order = Order::firstOrCreate(
            ['code' => 'EP-DEMO-0001'],
            [
                'user_id' => $student->id,
                'status' => Order::STATUS_PAID,
                'subtotal' => $subtotal,
                'discount' => 0,
                'total' => $subtotal,
                'currency' => 'USD',
                'payment_method' => 'demo',
                'paid_at' => now()->subDays(3),
            ]
        );

        foreach ($packages as $package) {
            $order->items()->firstOrCreate(
                ['package_id' => $package->id],
                [
                    'package_title' => $package->title,
                    'package_slug' => $package->slug,
                    'price' => $package->price,
                    'quantity' => 1,
                ]
            );

            Enrollment::firstOrCreate(
                ['user_id' => $student->id, 'package_id' => $package->id],
                [
                    'order_id' => $order->id,
                    'enrolled_at' => now()->subDays(3),
                ]
            );
        }
    }
}
