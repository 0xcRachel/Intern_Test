<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PAID = 'paid';

    public const STATUS_PENDING = 'pending';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'code',
        'status',
        'subtotal',
        'discount',
        'total',
        'currency',
        'coupon_code',
        'payment_method',
        'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount' => 'float',
        'total' => 'float',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }
}
