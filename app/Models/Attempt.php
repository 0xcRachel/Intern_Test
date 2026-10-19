<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Attempt extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'attempts';

    protected $fillable = [
        'user_id',
        'exam_id',
        'answers',
        'score',
        'is_passed',
        'status',
        'started_at',
        'submitted_at',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'exam_id' => 'integer',
        'answers' => 'array',
        'score' => 'float',
        'is_passed' => 'boolean',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];
}
