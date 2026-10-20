<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Package> */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        $title = fake()->words(3, true) . ' Package';

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->sentence(),
            'level' => fake()->randomElement(['Beginner', 'Intermediate', 'Advanced']),
            'duration_hours' => fake()->numberBetween(8, 40),
            'rating' => fake()->randomFloat(2, 4.2, 5),
            'students_count' => fake()->numberBetween(120, 2400),
            'is_featured' => false,
            'outcomes' => [
                'Nắm chiến lược làm bài theo từng dạng câu hỏi.',
                'Luyện tập có thời gian và xem lại đáp án chi tiết.',
                'Mở lại tài liệu đã mua trong thư viện cá nhân.',
            ],
            'price' => fake()->randomFloat(2, 10, 100),
            'is_active' => true,
        ];
    }
}
