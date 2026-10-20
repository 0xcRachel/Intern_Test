<?php

namespace Database\Factories;

use App\Models\Attempt;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Attempt> */
class AttemptFactory extends Factory
{
    protected $model = Attempt::class;

    public function definition(): array
    {
        $totalPoints = fake()->randomElement([10, 20, 40, 60]);
        $score = fake()->randomElement([0, $totalPoints * 0.5, $totalPoints * 0.75, $totalPoints]);
        $percentage = $totalPoints > 0 ? round(($score / $totalPoints) * 100, 2) : 0;
        $submitted = fake()->boolean(70);

        return [
            'user_id' => User::factory(),
            'exam_id' => Exam::factory(),
            'questions' => [],
            'answers' => [],
            'submitted_answers' => [],
            'wrong_questions' => [],
            'score' => $submitted ? $score : 0,
            'total_points' => $totalPoints,
            'percentage' => $submitted ? $percentage : 0,
            'is_passed' => $submitted && $percentage >= 60,
            'status' => $submitted ? 'submitted' : 'in_progress',
            'start_time' => now()->subMinutes(fake()->numberBetween(15, 120)),
            'end_time' => $submitted ? now()->subMinutes(fake()->numberBetween(1, 14)) : null,
            'started_at' => now()->subMinutes(120),
            'submitted_at' => $submitted ? now()->subMinutes(10) : null,
        ];
    }

    public function submitted(): static
    {
        return $this->state(fn () => [
            'status' => 'submitted',
            'end_time' => now()->subMinutes(5),
            'submitted_at' => now()->subMinutes(5),
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn () => [
            'status' => 'in_progress',
            'score' => 0,
            'percentage' => 0,
            'is_passed' => false,
            'end_time' => null,
            'submitted_at' => null,
        ]);
    }
}
