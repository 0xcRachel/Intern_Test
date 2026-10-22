<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PackageContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_realistic_package_factory_creates_pdf_and_audio_assets(): void
    {
        Storage::fake('local');

        $package = Package::factory()
            ->realistic([
                'title' => 'IELTS Factory Content Lab',
                'slug' => 'ielts-factory-content-lab',
            ])
            ->withCurriculum()
            ->create();

        $this->assertDatabaseCount('units', 3);
        $this->assertDatabaseCount('documents', 7);
        $this->assertSame(6, Document::query()->where('type', 'pdf')->count());
        $this->assertSame(1, Document::query()->where('type', 'audio')->count());

        foreach (Document::query()->whereHas('unit', fn ($query) => $query->where('package_id', $package->id))->get() as $document) {
            Storage::disk('local')->assertExists($document->file_path);
        }

    }
}
