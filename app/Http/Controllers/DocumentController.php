<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Enrollment;
use App\Models\PreviewLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class DocumentController extends Controller
{
    /**
     * Generate signed, time-boxed URL for document preview (rate-limited)
     */
    public function preview(Request $request, int $id): JsonResponse
    {
        $document = Document::findOrFail($id);

        // 15-minute time-boxed signed URL, bound to the requesting user
        $expiresAt = Carbon::now()->addMinutes(15);
        $signedUrl = URL::temporarySignedRoute(
            'documents.stream',
            $expiresAt,
            ['document' => $document->id, 'user' => $request->user()->id]
        );

        $previewPages = collect($document->preview_content ?? [])
            ->take($document->preview_pages)
            ->values()
            ->all();

        $owned = Enrollment::query()
            ->where('user_id', $request->user()->id)
            ->whereHas('package.units.documents', fn ($query) => $query->where('documents.id', $document->id))
            ->exists();

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
    public function stream(Request $request, int $document): JsonResponse
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

        // Log to MongoDB PreviewLog
        $expires = $request->query('expires');
        PreviewLog::create([
            'user_id' => (int) $userId,
            'document_id' => $doc->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'expires_at' => $expires ? Carbon::createFromTimestamp((int) $expires) : null,
            'accessed_at' => Carbon::now(),
        ]);

        return response()->json([
            'status' => 'authorized',
            'document' => [
                'id' => $doc->id,
                'title' => $doc->title,
                'type' => $doc->type,
                'total_pages' => $doc->total_pages,
                'preview_pages' => $doc->preview_pages,
            ],
            'message' => "Preview access granted for {$doc->type} document.",
        ]);
    }
}
