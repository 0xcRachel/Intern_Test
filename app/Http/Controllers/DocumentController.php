<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Enrollment;
use App\Models\PreviewLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class DocumentController extends Controller
{
    /**
     * Generate signed, time-boxed URL for document preview (rate-limited)
     */
    public function preview(Request $request, int $id): JsonResponse
    {
        $document = Document::findOrFail($id);

        $owned = Enrollment::query()
            ->where('user_id', $request->user()->id)
            ->whereHas('package.units.documents', fn ($query) => $query->where('documents.id', $document->id))
            ->exists();

        // Only paying users receive a stream URL. The source file is kept
        // private; guests and non-owners receive the bounded preview content
        // below and can never use the stream endpoint to download the file.
        $expiresAt = Carbon::now()->addMinutes(15);
        $signedUrl = $owned ? URL::temporarySignedRoute(
            'documents.stream',
            $expiresAt,
            ['document' => $document->id, 'user' => $request->user()->id]
        ) : null;

        $previewPages = collect($document->preview_content ?? [])
            ->take($document->preview_pages)
            ->values()
            ->all();

        if ($owned) {
            $previewPages = collect($document->preview_content ?? [])->values()->all();
        }

        // The React reader consumes preview_content directly, so record the
        // view here as well. The signed stream route keeps logging for embed
        // and backward-compatible consumers.
        PreviewLog::create([
            'user_id' => $request->user()->id,
            'document_id' => $document->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'expires_at' => $expiresAt,
            'accessed_at' => Carbon::now(),
        ]);

        return response()->json([
            'document_id' => $document->id,
            'title' => $document->title,
            'type' => $document->type,
            'total_pages' => $document->total_pages,
            'preview_pages' => $owned ? count($previewPages) : $document->preview_pages,
            'preview_content' => $previewPages,
            'locked_pages' => $owned ? 0 : max(0, $document->total_pages - count($previewPages)),
            'owned' => $owned,
            'preview_url' => $signedUrl,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    /**
     * Stream / view document preview with signature validation and MongoDB logging
     */
    public function stream(Request $request, int $document): Response|JsonResponse
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired preview URL signature.');
        }

        $userId = $request->query('user');

        if ($userId === null) {
            abort(403, 'Preview URL is missing the user context.');
        }

        // If the request also carries a bearer token, make sure the signed URL
        // belongs to that user. Unauthenticated viewers are still allowed so
        // the signed URL can be embedded in a document/audio iframe.
        $authenticatedUser = $request->user('sanctum');

        if ($authenticatedUser && (int) $authenticatedUser->id !== (int) $userId) {
            abort(403, 'This preview URL belongs to another user.');
        }

        $doc = Document::findOrFail($document);

        $owned = Enrollment::query()
            ->where('user_id', (int) $userId)
            ->whereHas('package.units.documents', fn ($query) => $query->whereKey($doc->id))
            ->exists();

        abort_unless($owned, 403, 'Tài liệu này chưa được mở khóa cho tài khoản.');

        PreviewLog::create([
            'user_id' => (int) $userId,
            'document_id' => $doc->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'expires_at' => Carbon::createFromTimestamp((int) $request->query('expires')),
            'accessed_at' => Carbon::now(),
        ]);

        $disk = Storage::disk('local');
        abort_unless($disk->exists($doc->file_path), 404, 'Preview file is unavailable.');
        $mime = $doc->type === 'audio'
            ? match (strtolower(pathinfo($doc->file_path, PATHINFO_EXTENSION))) {
                'wav' => 'audio/wav',
                'ogg' => 'audio/ogg',
                default => 'audio/mpeg',
            }
        : 'application/pdf';

        return response($disk->get($doc->file_path), 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="'.addslashes($doc->title).'"',
            'Cache-Control' => 'private, no-store',
            'X-Preview-Pages' => (string) $doc->preview_pages,
        ]);
    }
}
