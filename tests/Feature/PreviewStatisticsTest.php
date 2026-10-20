<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Package;
use App\Models\PreviewLog;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PreviewStatisticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_ranked_preview_statistics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $students = User::factory()->count(3)->create(['role' => 'student']);

        $package = Package::factory()->create(['title' => 'IELTS Reading Lab']);
        $unit = Unit::factory()->create(['package_id' => $package->id]);
        $popular = Document::factory()->create([
            'unit_id' => $unit->id,
            'title' => 'Popular Reading Guide.pdf',
        ]);
        $lessPopular = Document::factory()->create([
            'unit_id' => $unit->id,
            'title' => 'Listening Notes.mp3',
            'type' => 'audio',
        ]);

        foreach ([[$popular, $students[0]], [$popular, $students[1]], [$popular, $students[2]], [$lessPopular, $students[0]]] as [$document, $student]) {
            PreviewLog::create([
                'user_id' => $student->id,
                'document_id' => $document->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'PHPUnit',
                'accessed_at' => now(),
            ]);
        }

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/preview-statistics')
            ->assertOk()
            ->assertJsonPath('data.totals.preview_views', 4)
            ->assertJsonPath('data.totals.unique_viewers', 3)
            ->assertJsonPath('data.totals.documents_viewed', 2)
            ->assertJsonPath('data.totals.packages_viewed', 1)
            ->assertJsonPath('data.top_documents.0.document_id', $popular->id)
            ->assertJsonPath('data.top_documents.0.views', 3)
            ->assertJsonPath('data.top_packages.0.package_id', $package->id)
            ->assertJsonPath('data.top_packages.0.views', 4);
    }

    public function test_student_cannot_view_preview_statistics(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'student']));

        $this->getJson('/api/admin/preview-statistics')->assertForbidden();
    }
}
