<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Package;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class IeltsPackageSeeder extends Seeder
{
    public function run(): void
    {
        $package = Package::firstOrCreate(
            ['title' => 'IELTS Comprehensive Band 8.0+ Prep'],
            [
                'description' => 'Master all 4 IELTS modules with authentic Cambridge practice tests, audio tracks, and strategies.',
                'price' => 49.99,
                'is_active' => true,
            ]
        );

        $unit1 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 1: Academic & General Reading Mastery'],
            ['description' => 'Skimming, scanning, True/False/Not Given, and summary completion mastery.', 'order' => 1]
        );

        $this->ensurePlaceholder(
            'documents/reading_handbook.pdf',
            "%PDF-1.4\n% IELTS placeholder document\n%%EOF\n"
        );

        Document::firstOrCreate(
            ['unit_id' => $unit1->id, 'title' => 'Academic Reading Official Handbook.pdf'],
            ['type' => 'pdf', 'file_path' => 'documents/reading_handbook.pdf', 'total_pages' => 36, 'preview_pages' => 5]
        );

        $unit2 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 2: Listening Section 1-4 Immersion'],
            ['description' => 'Accents, note-taking, map labeling, and fast-speech comprehension.', 'order' => 2]
        );

        $this->ensurePlaceholder(
            'documents/listening_test1.mp3',
            "ID3\x04\x00\x00\x00\x00\x00\x00\xff\xfb\x90\x64\x00\x00\x00\x00"
        );

        Document::firstOrCreate(
            ['unit_id' => $unit2->id, 'title' => 'Listening Practice Test 1 - Audio Track.mp3'],
            ['type' => 'audio', 'file_path' => 'documents/listening_test1.mp3', 'total_pages' => 1, 'preview_pages' => 1]
        );

        $this->ensurePlaceholder(
            'documents/transcripts.pdf',
            "%PDF-1.4\n% IELTS placeholder transcripts\n%%EOF\n"
        );

        Document::firstOrCreate(
            ['unit_id' => $unit2->id, 'title' => 'Listening Transcripts & Answer Keys.pdf'],
            ['type' => 'pdf', 'file_path' => 'documents/transcripts.pdf', 'total_pages' => 18, 'preview_pages' => 3]
        );
    }

    private function ensurePlaceholder(string $path, string $contents): void
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            $disk->put($path, $contents);
        }
    }
}
