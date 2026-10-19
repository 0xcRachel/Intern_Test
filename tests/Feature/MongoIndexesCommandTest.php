<?php

namespace Tests\Feature;

use Tests\TestCase;

class MongoIndexesCommandTest extends TestCase
{
    public function test_command_skips_when_mongodb_is_disabled(): void
    {
        $this->artisan('app:ensure-mongo-indexes')
            ->expectsOutput('MongoDB is disabled; skipping index creation.')
            ->assertSuccessful();
    }
}
