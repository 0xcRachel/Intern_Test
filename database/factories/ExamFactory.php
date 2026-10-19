<?php

namespace Database\Factories;

use App\Models\Exam;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Exam> */
class ExamFactory extends Factory
{
    protected $model = Exam::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'duration_minutes' => fake()->randomElement([30, 60, 90, 120]),
            'passing_score' => fake()->numberBetween(40, 80),
        ];
    }
}
