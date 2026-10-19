<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Package> */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        return [
            'title' => fake()->words(3, true) . ' Package',
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 10, 100),
            'is_active' => true,
        ];
    }
}
