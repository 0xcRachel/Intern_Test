<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Enrollment;
use App\Models\PreviewLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentPreviewTest extends TestCase
{
    use RefreshDatabase;

    private Document $document;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->user = User::factory()->create(['role' => 'student']);

        $this->document = Document::factory()->create([
            'title' => 'IELTS Reading Official Guide.pdf',
            'type' => 'pdf',
            'total_pages' => 30,
            'preview_pages' => 5,
        ]);
        Storage::disk('local')->put($this->document->file_path, "%PDF-1.4\npreview fixture\n%%EOF\n");
    }

    private function signedStreamUrl(?int $userId = null, ?Carbon $expiresAt = null): string
    {
        return URL::temporarySignedRoute(
            'documents.stream',
            $expiresAt ?? Carbon::now()->addMinutes(15),
            [
                'document' => $this->document->id,
                'user' => $userId ?? $this->user->id,
            ]
        );
    }

    public function test_can_generate_signed_time_boxed_preview_url(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/documents/{$this->document->id}/preview");

        $response->assertStatus(200)
            ->assertJsonPath('document_id', $this->document->id)
            ->assertJsonPath('title', 'IELTS Reading Official Guide.pdf')
            ->assertJsonPath('total_pages', 30)
            ->assertJsonPath('preview_pages', 5)
            ->assertJsonPath('preview_url', null)
            ->assertJsonStructure(['expires_at']);
    }

    public function test_unauthenticated_user_cannot_generate_preview_url(): void
    {
        $response = $this->postJson("/api/documents/{$this->document->id}/preview");

        $response->assertStatus(401);
    }

    public function test_valid_signed_url_grants_access_and_logs_to_preview_logs(): void
    {
        Enrollment::create([
            'user_id' => $this->user->id,
            'package_id' => $this->document->unit->package_id,
            'enrolled_at' => now(),
        ]);

        $response = $this->getJson($this->signedStreamUrl());

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('X-Preview-Pages', '5');

        // Verify log created and bound to the signed user
        $log = PreviewLog::where('document_id', $this->document->id)->first();
        $this->assertNotNull($log);
        $this->assertSame($this->user->id, $log->user_id);
        $this->assertNotNull($log->accessed_at);
    }

    public function test_signed_url_for_another_user_is_rejected_when_authenticated(): void
    {
        $otherUser = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($this->user);

        $response = $this->getJson($this->signedStreamUrl($otherUser->id));

        $response->assertStatus(403);
    }

    public function test_signed_url_without_user_context_is_rejected(): void
    {
        $signedUrl = URL::temporarySignedRoute(
            'documents.stream',
            Carbon::now()->addMinutes(15),
            ['document' => $this->document->id]
        );

        $this->getJson($signedUrl)->assertStatus(403);
    }

    public function test_invalid_signature_returns_403(): void
    {
        // Tamper the signature
        $tamperedUrl = $this->signedStreamUrl().'tampered';

        $this->getJson($tamperedUrl)->assertStatus(403);
    }

    public function test_expired_signature_returns_403(): void
    {
        // Expired 5 minutes ago
        $expiredUrl = $this->signedStreamUrl(
            expiresAt: Carbon::now()->subMinutes(5),
        );

        $this->getJson($expiredUrl)->assertStatus(403);
    }

    public function test_preview_generation_is_rate_limited(): void
    {
        Sanctum::actingAs($this->user);

        // Max 10 requests per minute allowed
        for ($i = 0; $i < 10; $i++) {
            $this->postJson("/api/documents/{$this->document->id}/preview");
        }

        // 11th request should be throttled
        $this->postJson("/api/documents/{$this->document->id}/preview")
            ->assertStatus(429);
    }
}
