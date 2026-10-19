<?php

namespace App\Models;

if (extension_loaded('mongodb')) {
    class BaseAttempt extends \MongoDB\Laravel\Eloquent\Model {}
} else {
    class BaseAttempt extends \Illuminate\Database\Eloquent\Model {}
}

class Attempt extends BaseAttempt
{
    protected $connection = 'mongodb';
    protected $collection = 'attempts';
    protected $table = 'attempts';

    public function getConnectionName()
    {
        if (! extension_loaded('mongodb')) {
            return config('database.default');
        }

        return $this->connection ?? 'mongodb';
    }

    public function __construct(array $attributes = [])
    {
        if (! extension_loaded('mongodb')) {
            $this->connection = config('database.default');
        }
        parent::__construct($attributes);
    }

    protected $fillable = [
        'user_id',
        'exam_id',
        'questions',
        'submitted_answers',
        'answers',
        'wrong_questions',
        'score',
        'total_points',
        'percentage',
        'is_passed',
        'status',
        'start_time',
        'end_time',
        'started_at',
        'submitted_at',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'exam_id' => 'integer',
        'questions' => 'array',
        'submitted_answers' => 'array',
        'answers' => 'array',
        'wrong_questions' => 'array',
        'score' => 'float',
        'total_points' => 'float',
        'percentage' => 'float',
        'is_passed' => 'boolean',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
}
