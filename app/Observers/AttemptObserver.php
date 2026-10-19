<?php

namespace App\Observers;

use App\Events\AttemptSubmitted;
use App\Models\Attempt;

class AttemptObserver
{
    public function updated(Attempt $attempt): void
    {
        if ($attempt->wasChanged('status') && $attempt->status === 'completed') {
            event(new AttemptSubmitted($attempt));
        }
    }
}
