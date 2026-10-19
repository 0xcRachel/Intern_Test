<?php

namespace App\Listeners;

use App\Events\ExamCreated;
use App\Models\ActivityLog;

class LogExamActivity
{
    public function handle(ExamCreated $event): void
    {
        $user = auth()->user();

        ActivityLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Admin',
            'action' => 'exam_created',
            'description' => "Exam '{$event->exam->title}' was created.",
            'metadata' => [
                'exam_id' => $event->exam->id,
                'title' => $event->exam->title,
                'duration_minutes' => $event->exam->duration_minutes,
                'passing_score' => $event->exam->passing_score,
            ],
            'properties' => [
                'exam_id' => $event->exam->id,
                'title' => $event->exam->title,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
