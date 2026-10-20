<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'title',
        'type',
        'file_path',
        'total_pages',
        'preview_pages',
        'preview_content',
    ];

    protected $casts = [
        'total_pages' => 'integer',
        'preview_pages' => 'integer',
        'preview_content' => 'array',
    ];

    protected $hidden = [
        'file_path',
        'preview_content',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
