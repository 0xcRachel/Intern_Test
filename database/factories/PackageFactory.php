<?php

namespace Database\Factories;

use App\Models\Package;
use App\Services\PackageContentService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Package> */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        $title = fake()->words(3, true).' Package';

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1000, 9999),
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

    /**
     * Use a realistic IELTS course profile when a test or seeder needs
     * catalogue-like data instead of generic Faker text.
     */
    public function realistic(array $attributes = []): static
    {
        return $this->state(fn (): array => $attributes + [
            'description' => 'Lộ trình học IELTS có hướng dẫn, bài luyện theo dạng câu hỏi và tài liệu xem lại sau mỗi buổi học.',
            'level' => fake()->randomElement(['Beginner', 'Intermediate', 'Advanced']),
            'duration_hours' => fake()->randomElement([12, 16, 20, 24, 30, 36]),
            'rating' => fake()->randomFloat(2, 4.5, 4.9),
            'students_count' => fake()->numberBetween(180, 3200),
            'outcomes' => [
                'Hiểu chiến lược làm bài theo từng dạng câu hỏi.',
                'Luyện tập theo lộ trình có thời gian và đáp án giải thích.',
                'Theo dõi tiến bộ và xem lại tài liệu trong thư viện cá nhân.',
            ],
        ]);
    }

    /**
     * Create an IELTS package with starter units, PDF previews and an audio track.
     */
    public function withCurriculum(int $unitCount = 3): static
    {
        return $this->afterCreating(function (Package $package) use ($unitCount): void {
            app(PackageContentService::class)->ensureStarterContent($package, $unitCount);
        });
    }
}
