<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePackageRequest;
use App\Http\Requests\UpdatePackageRequest;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use App\Services\PackageContentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    public function __construct(private readonly PackageContentService $packageContent) {}

    public function index(Request $request): JsonResponse
    {
        $packages = Package::query()
            ->withCount('units')
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim((string) $request->query('search'));
                $query->where(function ($builder) use ($search): void {
                    $builder->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($request->has('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
            ->orderByDesc('is_featured')
            ->latest()
            ->paginate(min(60, max(1, (int) $request->query('per_page', 20))));

        return PackageResource::collection($packages)
            ->response()
            ->setStatusCode(200);
    }

    public function store(StorePackageRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);

        $createStarterContent = $request->boolean('create_starter_content', true);
        unset($data['create_starter_content']);
        $package = Package::create($data);

        if ($createStarterContent) {
            $this->packageContent->ensureStarterContent($package);
        }

        return (new PackageResource($package->loadCount('units')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Package $package): PackageResource
    {
        return new PackageResource($package->loadCount('units'));
    }

    public function update(UpdatePackageRequest $request, Package $package): PackageResource
    {
        $data = $request->validated();

        if (array_key_exists('title', $data) && ! array_key_exists('slug', $data)) {
            $data['slug'] = Str::slug($data['title']);
        }

        $package->update($data);

        return new PackageResource($package->fresh()->loadCount('units'));
    }

    public function destroy(Package $package): JsonResponse
    {
        $package->update(['is_active' => false]);

        return response()->json([
            'message' => 'Khóa học đã được ẩn khỏi danh mục.',
        ]);
    }
}
