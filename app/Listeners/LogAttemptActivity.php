<?php

namespace App\Listeners;

use App\Events\AttemptSubmitted;
use App\Models\ActivityLog;
use App\Models\User;

class LogAttemptActivity
{
    public function handle(AttemptSubmitted $event): void
    {
        $attempt = $event->attempt;
        $user = User::find($attempt->user_id);

        ActivityLog::create([
            'user_id' => $attempt->user_id,
            'user_name' => $user?->name ?? 'Student',
            'action' => 'attempt_submitted',
            'description' => "Attempt for Exam #{$attempt->exam_id} was submitted with score {$attempt->score}.",
            'metadata' => [
                'attempt_id' => $attempt->id,
                'exam_id' => $attempt->exam_id,
                'score' => $attempt->score,
                'total_points' => $attempt->total_points,
                'percentage' => $attempt->percentage,
                'is_passed' => $attempt->is_passed,
            ],
            'properties' => [
                'attempt_id' => $attempt->id,
                'exam_id' => $attempt->exam_id,
                'score' => $attempt->score,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
