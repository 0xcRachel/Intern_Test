<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    /**
     * List packages with units and documents (eager-loaded to prevent N+1).
     * Supports search, level filtering and pagination for the catalogue UI.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Package::with(['units.documents'])
            ->where('is_active', true);

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('level')) {
            $query->where('level', $request->query('level'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $perPage = min(60, max(1, (int) $request->query('per_page', 24)));
        $packages = $query->orderByDesc('is_featured')->latest()->paginate($perPage);

        $packages->getCollection()->transform(fn (Package $package) => $this->present($package, false));

        return response()->json([
            'data' => $packages->items(),
            'total' => $packages->total(),
            'meta' => [
                'current_page' => $packages->currentPage(),
                'last_page' => $packages->lastPage(),
                'total' => $packages->total(),
                'per_page' => $packages->perPage(),
            ],
        ])->header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    }

    /**
     * Show a package by numeric id or human-friendly slug.
     */
    public function show(string $identifier): JsonResponse
    {
        $package = Package::with(['units.documents'])
            ->where('is_active', true)
            ->where(function ($query) use ($identifier) {
                $query->where('slug', $identifier);
                if (ctype_digit($identifier)) {
                    $query->orWhere('id', (int) $identifier);
                }
            })
            ->firstOrFail();

        return response()->json([
            'data' => $this->present($package),
        ])->header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    }

    protected function present(Package $package, bool $includeUnits = true): array
    {
        $documents = $package->units->flatMap(fn ($unit) => $unit->documents);
        $data = $package->toArray();

        if (! $includeUnits) {
            unset($data['units']);
        }

        return [
            ...$data,
            'units_count' => $package->units->count(),
            'documents_count' => $documents->count(),
            'pdf_count' => $documents->where('type', 'pdf')->count(),
            'audio_count' => $documents->where('type', 'audio')->count(),
        ];
    }
}
