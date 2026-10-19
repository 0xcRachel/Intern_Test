<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Question> */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'question_text' => fake()->sentence() . '?',
            'type' => 'single_choice',
            'points' => fake()->numberBetween(1, 10),
        ];
    }
}
