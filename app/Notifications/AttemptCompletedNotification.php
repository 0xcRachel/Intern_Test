<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class AttemptCompletedNotification extends Notification
{
    public function __construct(
        private readonly int|string $attemptId,
        private readonly string $examTitle,
        private readonly float $percentage,
        private readonly bool $passed,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'tone' => $this->passed ? 'success' : 'info',
            'title' => 'Đã có kết quả bài làm',
            'message' => "{$this->examTitle}: {$this->percentage}% · ".($this->passed ? 'Đạt' : 'Chưa đạt'),
            'action_url' => "/attempts/{$this->attemptId}/result",
            'attempt_id' => $this->attemptId,
            'percentage' => $this->percentage,
            'is_passed' => $this->passed,
        ];
    }
}
