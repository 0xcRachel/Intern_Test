<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
            $table->string('provider')->nullable()->after('role');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('target_band', 16)->nullable()->after('provider_id');
            $table->text('bio')->nullable()->after('target_band');
            $table->index(['provider', 'provider_id']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['provider', 'provider_id']);
            $table->dropColumn(['avatar', 'provider', 'provider_id', 'target_band', 'bio']);
        });
    }
};
