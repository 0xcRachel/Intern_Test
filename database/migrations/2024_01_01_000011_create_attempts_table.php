<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('attempts')) {
            Schema::create('attempts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
                $table->json('questions')->nullable();
                $table->json('submitted_answers')->nullable();
                $table->json('answers')->nullable();
                $table->json('wrong_questions')->nullable();
                $table->float('score')->default(0);
                $table->float('total_points')->default(0);
                $table->float('percentage')->default(0);
                $table->boolean('is_passed')->default(false);
                $table->string('status')->default('in_progress');
                $table->timestamp('start_time')->nullable();
                $table->timestamp('end_time')->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('submitted_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('attempts');
    }
};
