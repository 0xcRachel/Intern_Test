<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Package;
use App\Models\User;
use App\Notifications\OrderActivatedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * Create a paid demo order and enroll the learner in every purchased package.
     * Prices are always read from the database, never trusted from the client.
     */
    public function checkout(User $user, array $packageIds, ?string $couponCode = null): Order
    {
        $packages = $this->resolvePackages($user, $packageIds);

        $subtotal = round((float) $packages->sum('price'), 2);
        $coupon = $this->resolveCoupon($couponCode);
        $discount = $coupon ? $coupon->discountFor($subtotal) : 0.0;
        $total = round(max(0, $subtotal - $discount), 2);

        $order = DB::transaction(function () use ($user, $packages, $subtotal, $discount, $total, $coupon) {
            $order = Order::create([
                'user_id' => $user->id,
                'code' => $this->nextOrderCode(),
                'status' => Order::STATUS_PAID,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'currency' => 'USD',
                'coupon_code' => $coupon?->code,
                'payment_method' => 'demo',
                'paid_at' => now(),
            ]);

            foreach ($packages as $package) {
                $order->items()->create([
                    'package_id' => $package->id,
                    'package_title' => $package->title,
                    'package_slug' => $package->slug,
                    'price' => $package->price,
                    'quantity' => 1,
                ]);

                Enrollment::create([
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'order_id' => $order->id,
                    'enrolled_at' => now(),
                ]);
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            return $order->load(['items', 'enrollments.package.units.documents']);
        });

        $user->notify(new OrderActivatedNotification($order));

        User::query()
            ->where('role', 'admin')
            ->where('id', '!=', $user->id)
            ->get()
            ->each(fn (User $admin): mixed => $admin->notify(new OrderActivatedNotification($order, true)));

        return $order;
    }

    /**
     * Preview an order total without writing anything to the database.
     */
    public function quote(User $user, array $packageIds, ?string $couponCode = null): array
    {
        $packages = $this->resolvePackages($user, $packageIds);

        $subtotal = round((float) $packages->sum('price'), 2);
        $coupon = $this->resolveCoupon($couponCode);
        $discount = $coupon ? $coupon->discountFor($subtotal) : 0.0;

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => round(max(0, $subtotal - $discount), 2),
            'coupon' => $coupon ? [
                'code' => $coupon->code,
                'label' => $coupon->label,
                'type' => $coupon->type,
                'value' => $coupon->value,
            ] : null,
        ];
    }

    /**
     * Validate available packages and make sure the learner does not already own one.
     */
    protected function resolvePackages(User $user, array $packageIds)
    {
        $ids = collect($packageIds)
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            throw ValidationException::withMessages([
                'package_ids' => 'Vui lòng chọn ít nhất một khóa học.',
            ]);
        }

        $packages = Package::query()
            ->whereIn('id', $ids)
            ->where('is_active', true)
            ->get();

        if ($packages->count() !== $ids->count()) {
            throw ValidationException::withMessages([
                'package_ids' => 'Một hoặc nhiều khóa học không còn khả dụng.',
            ]);
        }

        $owned = Enrollment::query()
            ->where('user_id', $user->id)
            ->whereIn('package_id', $ids)
            ->pluck('package_id');

        if ($owned->isNotEmpty()) {
            throw ValidationException::withMessages([
                'package_ids' => 'Bạn đã sở hữu một hoặc nhiều khóa học trong đơn hàng.',
            ]);
        }

        return $packages;
    }

    protected function resolveCoupon(?string $code): ?Coupon
    {
        if (! $code || trim($code) === '') {
            return null;
        }

        $coupon = Coupon::where('code', Str::upper(trim($code)))->first();

        if (! $coupon || ! $coupon->isUsable()) {
            throw ValidationException::withMessages([
                'coupon' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',
            ]);
        }

        return $coupon;
    }

    protected function nextOrderCode(): string
    {
        do {
            $code = 'EP-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Order::where('code', $code)->exists());

        return $code;
    }
}
