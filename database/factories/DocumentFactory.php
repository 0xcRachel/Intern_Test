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
        return [
            'unit_id' => Unit::factory(),
            'title' => fake()->words(2, true) . ' Material',
            'type' => fake()->randomElement(['pdf', 'audio']),
            'file_path' => 'documents/' . fake()->uuid() . '.pdf',
            'total_pages' => 20,
            'preview_pages' => 3,
        ];
    }
}
