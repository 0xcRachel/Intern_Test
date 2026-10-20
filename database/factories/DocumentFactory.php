<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Document> */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['pdf', 'audio']);

        return [
            'unit_id' => Unit::factory(),
            'title' => fake()->words(2, true) . ' Material',
            'type' => $type,
            'file_path' => 'documents/' . fake()->uuid() . '.pdf',
            'total_pages' => 20,
            'preview_pages' => 3,
            'preview_content' => collect(range(1, 3))
                ->map(fn (int $page) => [
                    'heading' => $type === 'audio'
                        ? "Transcript preview · Part {$page}"
                        : "Preview page {$page}",
                    'body' => fake()->paragraphs(3, true),
                ])
                ->all(),
        ];
    }
}
