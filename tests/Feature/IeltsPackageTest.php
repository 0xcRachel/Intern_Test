<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Package;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IeltsPackageTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_active_packages_with_summary_counts(): void
    {
        $package = Package::factory()->create(['title' => 'IELTS Academic Masterclass', 'is_active' => true]);
        $unit = Unit::factory()->create(['package_id' => $package->id, 'title' => 'Unit 1: Listening Fundamentals']);
        Document::factory()->create(['unit_id' => $unit->id, 'title' => 'Audio Practice 1', 'type' => 'audio']);
        Document::factory()->create(['unit_id' => $unit->id, 'title' => 'Listening Worksheet', 'type' => 'pdf']);

        // Inactive package (should not be listed)
        Package::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/packages');

        $response->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.title', 'IELTS Academic Masterclass')
            ->assertJsonPath('data.0.units_count', 1)
            ->assertJsonPath('data.0.documents_count', 2)
            ->assertJsonPath('data.0.pdf_count', 1)
            ->assertJsonPath('data.0.audio_count', 1)
            ->assertJsonMissingPath('data.0.units');
    }

    public function test_can_view_single_package_details(): void
    {
        $package = Package::factory()->create(['title' => 'IELTS Speaking Pro']);
        $unit = Unit::factory()->create(['package_id' => $package->id]);
        Document::factory()->create(['unit_id' => $unit->id]);

        $response = $this->getJson("/api/packages/{$package->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $package->id)
            ->assertJsonPath('data.title', 'IELTS Speaking Pro')
            ->assertJsonCount(1, 'data.units');
    }

    public function test_404_on_nonexistent_package(): void
    {
        $response = $this->getJson('/api/packages/9999');

        $response->assertStatus(404);
    }
}
