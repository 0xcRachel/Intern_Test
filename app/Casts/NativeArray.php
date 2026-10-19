<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use MongoDB\BSON\Document;

/**
 * Store arrays as native BSON arrays on MongoDB, while keeping the
 * JSON-string representation required by the SQL (SQLite/MySQL) fallback.
 */
class NativeArray implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?array
    {
        if ($value === null) {
            return null;
        }

        if (is_array($value)) {
            return $value;
        }

        if ($value instanceof Document) {
            return $value->toPHP([
                'root' => 'array',
                'document' => 'array',
                'array' => 'array',
            ]);
        }

        if ($value instanceof \Traversable) {
            return iterator_to_array($value);
        }

        $decoded = json_decode((string) $value, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): array
    {
        if ($value === null) {
            return [$key => null];
        }

        if (! is_array($value)) {
            $value = (array) $value;
        }

        if ($model->getConnectionName() === 'mongodb') {
            return [$key => $value];
        }

        return [$key => json_encode($value)];
    }
}
