<?php

namespace App\Models;

if (extension_loaded('mongodb')) {
    class BasePreviewLog extends \MongoDB\Laravel\Eloquent\Model {}
} else {
    class BasePreviewLog extends \Illuminate\Database\Eloquent\Model {}
}

class PreviewLog extends BasePreviewLog
{
    protected $connection = 'mongodb';
    protected $collection = 'preview_logs';
    protected $table = 'preview_logs';

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
        'document_id',
        'ip_address',
        'user_agent',
        'expires_at',
        'accessed_at',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'document_id' => 'integer',
        'expires_at' => 'datetime',
        'accessed_at' => 'datetime',
    ];
}
