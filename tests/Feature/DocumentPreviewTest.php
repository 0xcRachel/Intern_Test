<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\PreviewLog;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class DocumentPreviewTest extends TestCase
{
    use RefreshDatabase;

    private Document $document;

    protected function setUp(): void
    {
        parent::setUp();

        $this->document = Document::factory()->create([
            'title' => 'IELTS Reading Official Guide.pdf',
            'type' => 'pdf',
            'total_pages' => 30,
            'preview_pages' => 5,
        ]);
    }

    public function test_can_generate_signed_time_boxed_preview_url(): void
    {
        $response = $this->postJson("/api/documents/{$this->document->id}/preview");

        $response->assertStatus(200)
            ->assertJsonPath('document_id', $this->document->id)
            ->assertJsonPath('title', 'IELTS Reading Official Guide.pdf')
            ->assertJsonPath('total_pages', 30)
            ->assertJsonPath('preview_pages', 5)
            ->assertJsonStructure(['preview_url', 'expires_at']);

        $previewUrl = $response->json('preview_url');
        $this->assertStringContainsString('signature=', $previewUrl);
        $this->assertStringContainsString('expires=', $previewUrl);
    }

    public function test_valid_signed_url_grants_access_and_logs_to_preview_logs(): void
    {
        $expiresAt = Carbon::now()->addMinutes(15);
        $signedUrl = URL::temporarySignedRoute(
            'documents.stream',
            $expiresAt,
            ['document' => $this->document->id]
        );

        $response = $this->getJson($signedUrl);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'authorized')
            ->assertJsonPath('document.id', $this->document->id)
            ->assertJsonPath('document.preview_pages', 5);

        // Verify log created
        $log = PreviewLog::where('document_id', $this->document->id)->first();
        $this->assertNotNull($log);
        $this->assertNotNull($log->accessed_at);
    }

    public function test_invalid_signature_returns_403(): void
    {
        $expiresAt = Carbon::now()->addMinutes(15);
        $validUrl = URL::temporarySignedRoute(
            'documents.stream',
            $expiresAt,
            ['document' => $this->document->id]
        );

        // Tamper signature
        $tamperedUrl = $validUrl . 'tampered';

        $response = $this->getJson($tamperedUrl);

        $response->assertStatus(403);
    }

    public function test_expired_signature_returns_403(): void
    {
        // Expired 5 minutes ago
        $expiredTime = Carbon::now()->subMinutes(5);
        $expiredUrl = URL::temporarySignedRoute(
            'documents.stream',
            $expiredTime,
            ['document' => $this->document->id]
        );

        $response = $this->getJson($expiredUrl);

        $response->assertStatus(403);
    }

    public function test_preview_generation_is_rate_limited(): void
    {
        // Max 10 requests per minute allowed
        for ($i = 0; $i < 10; $i++) {
            $this->postJson("/api/documents/{$this->document->id}/preview");
        }

        // 11th request should be throttled
        $response = $this->postJson("/api/documents/{$this->document->id}/preview");
        $response->assertStatus(429);
    }
}
