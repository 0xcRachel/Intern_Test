<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\PreviewLog;
use Illuminate\Console\Command;

class EnsureMongoIndexes extends Command
{
    protected $signature = 'app:ensure-mongo-indexes';

    protected $description = 'Create the MongoDB indexes used by attempts, activity logs and preview logs';

    public function handle(): int
    {
        if (! extension_loaded('mongodb') || ! config('database.mongodb_enabled', true)) {
            $this->warn('MongoDB is disabled; skipping index creation.');

            return self::SUCCESS;
        }

        try {
            Attempt::raw(fn ($collection) => $collection->createIndexes([
                [
                    'key' => ['user_id' => 1, 'created_at' => -1],
                    'name' => 'attempts_user_created',
                ],
                [
                    'key' => ['exam_id' => 1, 'status' => 1, 'created_at' => -1],
                    'name' => 'attempts_exam_status_created',
                ],
            ]));

            ActivityLog::raw(fn ($collection) => $collection->createIndexes([
                [
                    'key' => ['user_id' => 1, 'created_at' => -1],
                    'name' => 'activity_logs_user_created',
                ],
                [
                    'key' => ['action' => 1, 'created_at' => -1],
                    'name' => 'activity_logs_action_created',
                ],
                [
                    'key' => ['metadata.exam_id' => 1, 'created_at' => -1],
                    'name' => 'activity_logs_exam_created',
                ],
            ]));

            PreviewLog::raw(fn ($collection) => $collection->createIndexes([
                [
                    'key' => ['document_id' => 1, 'created_at' => -1],
                    'name' => 'preview_logs_document_created',
                ],
                [
                    'key' => ['user_id' => 1, 'created_at' => -1],
                    'name' => 'preview_logs_user_created',
                ],
            ]));
        } catch (\Throwable $e) {
            $this->error("MongoDB index creation failed: {$e->getMessage()}");

            return self::FAILURE;
        }

        $this->info('MongoDB indexes ensured.');

        return self::SUCCESS;
    }
}
