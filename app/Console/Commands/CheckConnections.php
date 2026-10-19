<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use MongoDB\Client as MongoClient;

class CheckConnections extends Command
{
    protected $signature = 'app:check-connections';
    protected $description = 'Check MySQL and MongoDB connection status';

    public function handle(): int
    {
        $this->info('Checking database connections...');
        $allOk = true;

        // SQL (MySQL in Docker/local, SQLite in tests)
        try {
            $connection = DB::connection();
            $connection->getPdo();
            $driver = $connection->getDriverName();
            $version = $driver === 'sqlite'
                ? $connection->selectOne('SELECT sqlite_version() as v')->v
                : $connection->selectOne('SELECT VERSION() as v')->v;
            $this->info("✓ {$driver} connected — v{$version}");
        } catch (\Throwable $e) {
            $this->error("✗ SQL connection failed: {$e->getMessage()}");
            $allOk = false;
        }

        // MongoDB
        try {
            $host = config('database.connections.mongodb.host');
            $port = config('database.connections.mongodb.port');
            $user = config('database.connections.mongodb.username');
            $pass = config('database.connections.mongodb.password');
            $db = config('database.connections.mongodb.database');

            $uri = $user
                ? "mongodb://{$user}:{$pass}@{$host}:{$port}/{$db}?authSource=admin"
                : "mongodb://{$host}:{$port}/{$db}";

            $client = new MongoClient($uri, [
                'connectTimeoutMS' => 3000,
                'serverSelectionTimeoutMS' => 3000,
            ]);
            $info = $client->selectDatabase($db)->command(['buildInfo' => 1])->toArray()[0];
            $version = $info->version ?? 'unknown';
            $this->info("✓ MongoDB connected — v{$version}");
        } catch (\Throwable $e) {
            $this->error("✗ MongoDB failed: {$e->getMessage()}");
            $allOk = false;
        }

        return $allOk ? self::SUCCESS : self::FAILURE;
    }
}
