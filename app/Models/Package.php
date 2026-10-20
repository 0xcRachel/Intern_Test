<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'level',
        'duration_hours',
        'rating',
        'students_count',
        'is_featured',
        'outcomes',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'rating' => 'float',
        'duration_hours' => 'integer',
        'students_count' => 'integer',
        'is_featured' => 'boolean',
        'outcomes' => 'array',
        'is_active' => 'boolean',
    ];

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class)->orderBy('order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }
}
