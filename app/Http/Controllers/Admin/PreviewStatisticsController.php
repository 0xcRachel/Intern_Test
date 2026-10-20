<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\PreviewLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class PreviewStatisticsController extends Controller
{
    /**
     * Aggregate preview activity for the admin report.
     *
     * Preview volume is low in this demo, so grouping in PHP keeps the query
     * portable between MongoDB and the SQLite test fallback. Document and
     * package metadata are loaded in two queries rather than per log row.
     */
    public function index(): JsonResponse
    {
        $logs = PreviewLog::query()->get();
        $groupedByDocument = $logs->groupBy('document_id');

        $documents = Document::with('unit.package')
            ->whereIn('id', $groupedByDocument->keys())
            ->get()
            ->keyBy('id');

        $topDocuments = $groupedByDocument
            ->map(function (Collection $documentLogs, $documentId) use ($documents) {
                $document = $documents->get((int) $documentId);
                $package = $document?->unit?->package;

                return [
                    'document_id' => (int) $documentId,
                    'title' => $document?->title ?? 'Tài liệu đã xóa',
                    'type' => $document?->type,
                    'package_title' => $package?->title,
                    'package_slug' => $package?->slug,
                    'views' => $documentLogs->count(),
                    'unique_viewers' => $documentLogs->pluck('user_id')->unique()->count(),
                    'last_viewed_at' => $this->latestAccess($documentLogs),
                ];
            })
            ->sortByDesc('views')
            ->take(10)
            ->values();

        $packageBuckets = [];

        foreach ($groupedByDocument as $documentId => $documentLogs) {
            $document = $documents->get((int) $documentId);
            $package = $document?->unit?->package;

            if (! $package) {
                continue;
            }

            $bucket = $packageBuckets[$package->id] ?? [
                'package_id' => $package->id,
                'title' => $package->title,
                'slug' => $package->slug,
                'views' => 0,
                'documents' => [],
                'viewer_ids' => [],
            ];

            $bucket['views'] += $documentLogs->count();
            $bucket['documents'][$documentId] = true;
            $bucket['viewer_ids'] = array_merge(
                $bucket['viewer_ids'],
                $documentLogs->pluck('user_id')->all(),
            );
            $latest = $this->latestAccess($documentLogs);
            if ($latest && (! isset($bucket['last_viewed_at']) || $latest > $bucket['last_viewed_at'])) {
                $bucket['last_viewed_at'] = $latest;
            }

            $packageBuckets[$package->id] = $bucket;
        }

        $topPackages = collect($packageBuckets)
            ->map(fn (array $bucket) => [
                'package_id' => $bucket['package_id'],
                'title' => $bucket['title'],
                'slug' => $bucket['slug'],
                'views' => $bucket['views'],
                'documents_viewed' => count($bucket['documents']),
                'unique_viewers' => count(array_unique($bucket['viewer_ids'])),
                'last_viewed_at' => $bucket['last_viewed_at'] ?? null,
            ])
            ->sortByDesc('views')
            ->take(10)
            ->values();

        return response()->json([
            'data' => [
                'totals' => [
                    'preview_views' => $logs->count(),
                    'unique_viewers' => $logs->pluck('user_id')->unique()->count(),
                    'documents_viewed' => $groupedByDocument->count(),
                    'packages_viewed' => count($packageBuckets),
                    'last_viewed_at' => $this->latestAccess($logs),
                ],
                'top_documents' => $topDocuments,
                'top_packages' => $topPackages,
                'recent_views' => $logs->sortByDesc(fn ($log) => $log->accessed_at?->timestamp ?? 0)
                    ->take(12)
                    ->map(fn (PreviewLog $log) => [
                        'id' => $log->id,
                        'document_id' => $log->document_id,
                        'document_title' => $documents->get((int) $log->document_id)?->title ?? 'Tài liệu đã xóa',
                        'user_id' => $log->user_id,
                        'ip_address' => $log->ip_address,
                        'accessed_at' => $log->accessed_at,
                    ])
                    ->values(),
            ],
        ]);
    }

    private function latestAccess(Collection $logs): ?string
    {
        $latest = $logs->max(fn ($log) => $log->accessed_at?->timestamp ?? 0);

        if (! $latest) {
            return null;
        }

        return now()->setTimestamp((int) $latest)->toIso8601String();
    }
}
