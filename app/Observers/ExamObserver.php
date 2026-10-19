<?php

namespace App\Observers;

use App\Events\ExamCreated;
use App\Models\Exam;

class ExamObserver
{
    public function created(Exam $exam): void
    {
        event(new ExamCreated($exam));
    }
}
