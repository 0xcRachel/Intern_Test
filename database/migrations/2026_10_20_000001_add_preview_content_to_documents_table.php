<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('documents', 'preview_content')) {
            Schema::table('documents', function (Blueprint $table) {
                // Only the first `preview_pages` pages are exposed by the API.
                // The rest of the document is never serialized to the client.
                $table->json('preview_content')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('documents', 'preview_content')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropColumn('preview_content');
            });
        }
    }
};
