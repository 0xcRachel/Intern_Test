<?php

namespace App\Models;

use App\Casts\NativeArray;

if (extension_loaded('mongodb') && config('database.mongodb_enabled', true)) {
    class BaseActivityLog extends \MongoDB\Laravel\Eloquent\Model {}
} else {
    class BaseActivityLog extends \Illuminate\Database\Eloquent\Model {}
}

class ActivityLog extends BaseActivityLog
{
    protected $connection = 'mongodb';
    protected $collection = 'activity_logs';
    protected $table = 'activity_logs';

    public function getConnectionName()
    {
        if (! extension_loaded('mongodb') || ! config('database.mongodb_enabled', true)) {
            return config('database.default');
        }

        return $this->connection ?? 'mongodb';
    }

    public function __construct(array $attributes = [])
    {
        if (! extension_loaded('mongodb') || ! config('database.mongodb_enabled', true)) {
            $this->connection = config('database.default');
        }
        parent::__construct($attributes);
    }

    protected $fillable = [
        'user_id',
        'user_name',
        'action',
        'description',
        'metadata',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'metadata' => NativeArray::class,
        'properties' => NativeArray::class,
    ];
}
