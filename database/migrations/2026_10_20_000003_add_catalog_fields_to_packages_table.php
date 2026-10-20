<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('title');
            $table->string('level', 32)->default('Beginner')->after('description');
            $table->unsignedInteger('duration_hours')->default(0)->after('level');
            $table->decimal('rating', 3, 2)->default(4.80)->after('duration_hours');
            $table->unsignedInteger('students_count')->default(0)->after('rating');
            $table->boolean('is_featured')->default(false)->after('students_count');
            $table->json('outcomes')->nullable()->after('is_featured');
        });

        $used = [];
        foreach (DB::table('packages')->orderBy('id')->get() as $package) {
            $base = Str::slug($package->title) ?: 'ielts-package';
            $slug = $base;
            $suffix = 2;
            while (in_array($slug, $used, true)) {
                $slug = "{$base}-{$suffix}";
                $suffix++;
            }
            $used[] = $slug;

            DB::table('packages')->where('id', $package->id)->update([
                'slug' => $slug,
                'duration_hours' => $package->id % 2 === 0 ? 24 : 18,
                'rating' => 4.70 + (($package->id % 3) * 0.10),
                'students_count' => 180 + ($package->id * 37),
                'is_featured' => $package->id === DB::table('packages')->min('id'),
            ]);
        }

        Schema::table('packages', function (Blueprint $table) {
            $table->unique('slug');
            $table->index(['level', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropIndex(['level', 'is_active']);
            $table->dropColumn([
                'slug',
                'level',
                'duration_hours',
                'rating',
                'students_count',
                'is_featured',
                'outcomes',
            ]);
        });
    }
};
