<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Package;
use App\Models\Unit;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PackageContentService
{
    /**
     * Add a reusable starter curriculum to a package.
     *
     * Seeders and the admin create flow can call this repeatedly without
     * duplicating units, documents, or storage assets.
     */
    public function ensureStarterContent(Package $package, int $unitCount = 3): void
    {
        $unitBlueprints = [
            ['title' => 'Unit 1: Core Strategy', 'description' => 'Nắm cấu trúc, từ vựng trọng tâm và chiến lược làm bài.'],
            ['title' => 'Unit 2: Guided Practice', 'description' => 'Luyện tập theo dạng câu hỏi với bài đọc, audio và transcript.'],
            ['title' => 'Unit 3: Review & Progress', 'description' => 'Kiểm tra lại lỗi thường gặp và xây kế hoạch luyện tập tiếp theo.'],
        ];

        $unitBlueprints = array_slice($unitBlueprints, 0, max(1, min($unitCount, count($unitBlueprints))));
        $slug = Str::slug($package->slug ?: $package->title) ?: 'package-'.$package->id;

        foreach ($unitBlueprints as $index => $blueprint) {
            $order = $index + 1;
            $unit = Unit::updateOrCreate(
                ['package_id' => $package->id, 'title' => $blueprint['title']],
                ['description' => $blueprint['description'], 'order' => $order]
            );

            $this->upsertDocument($unit, $slug, $order, 'Strategy Workbook.pdf', 'pdf', 18, 3);
            $this->upsertDocument($unit, $slug, $order, 'Practice & Answer Key.pdf', 'pdf', 14, 2);

            if ($order === 2) {
                $this->upsertDocument($unit, $slug, $order, 'Guided Listening Track.mp3', 'audio', 1, 1);
            }
        }
    }

    private function upsertDocument(
        Unit $unit,
        string $packageSlug,
        int $unitOrder,
        string $title,
        string $type,
        int $totalPages,
        int $previewPages
    ): void {
        $extension = $type === 'audio' ? 'wav' : 'pdf';
        $filename = Str::slug(pathinfo($title, PATHINFO_FILENAME)).'.'.$extension;
        $path = "documents/catalog/{$packageSlug}/unit-{$unitOrder}/{$filename}";

        if (! Storage::disk('local')->exists($path)) {
            Storage::disk('local')->put($path, $type === 'audio' ? $this->wavFixture() : $this->pdfFixture());
        }

        Document::updateOrCreate(
            ['unit_id' => $unit->id, 'title' => $title],
            [
                'type' => $type,
                'file_path' => $path,
                'total_pages' => $totalPages,
                'preview_pages' => $previewPages,
                'preview_content' => $this->previewContent($type, $title, $previewPages),
            ]
        );
    }

    /**
     * @return array<int, array{heading: string, body: string}>
     */
    private function previewContent(string $type, string $title, int $pages): array
    {
        return collect(range(1, $pages))->map(fn (int $page): array => [
            'heading' => $type === 'audio'
                ? "Transcript preview · {$title}"
                : "{$title} · Preview page {$page}",
            'body' => $type === 'audio'
                ? 'Listen for signposting language, key numbers and corrected information. This transcript preview is the opening section of the guided practice track.'
                : "Use this page to practise one focused IELTS skill. Identify the task, underline the evidence and write a short note explaining why your answer is correct.\n\nThe complete document contains the full practice set, answer key and review checklist.",
        ])->all();
    }

    private function pdfFixture(): string
    {
        $stream = 'BT /F1 18 Tf 72 720 Td (ExamPlatform IELTS practice preview) Tj ET';
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream",
        ];
        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $number => $object) {
            $offsets[$number + 1] = strlen($pdf);
            $pdf .= ($number + 1)." 0 obj\n{$object}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        for ($index = 1; $index <= count($objects); $index++) {
            $pdf .= sprintf('%010d 00000 n %s', $offsets[$index], "\n");
        }
        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF\n";

        return $pdf;
    }

    private function wavFixture(): string
    {
        $sampleRate = 8000;
        $samples = str_repeat("\x00\x00", $sampleRate * 2);

        return 'RIFF'.pack('V', 36 + strlen($samples)).'WAVEfmt '.pack('VvvVVvv', 16, 1, 1, $sampleRate, $sampleRate * 2, 2, 16).'data'.pack('V', strlen($samples)).$samples;
    }
}
