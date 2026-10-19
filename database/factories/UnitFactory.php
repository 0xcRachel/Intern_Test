<?php

namespace Database\Factories;

use App\Models\Package;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Unit> */
class UnitFactory extends Factory
{
    protected $model = Unit::class;

    public function definition(): array
    {
        return [
            'package_id' => Package::factory(),
            'title' => 'Unit ' . fake()->numberBetween(1, 10),
            'description' => fake()->sentence(),
            'order' => fake()->numberBetween(1, 10),
        ];
    }
}
