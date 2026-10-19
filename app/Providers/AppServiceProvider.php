<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        \App\Models\Exam::observe(\App\Observers\ExamObserver::class);
        \App\Models\Attempt::observe(\App\Observers\AttemptObserver::class);

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\ExamCreated::class,
            \App\Listeners\LogExamActivity::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\AttemptSubmitted::class,
            \App\Listeners\LogAttemptActivity::class
        );
    }
}
