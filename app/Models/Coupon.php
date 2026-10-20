<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'label',
        'type',
        'value',
        'is_active',
        'expires_at',
        'usage_limit',
        'used_count',
    ];

    protected $casts = [
        'value' => 'float',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
    ];

    public function isUsable(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function discountFor(float $subtotal): float
    {
        $discount = $this->type === 'percent'
            ? $subtotal * ($this->value / 100)
            : $this->value;

        return round(max(0, min($subtotal, $discount)), 2);
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }
}
