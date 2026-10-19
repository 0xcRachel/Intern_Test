<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    /**
     * List packages with units and documents (eager-loaded to prevent N+1)
     */
    public function index(Request $request): JsonResponse
    {
        $packages = Package::with(['units.documents'])
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'data' => $packages,
            'total' => $packages->count(),
        ]);
    }

    /**
     * Show package details with units and documents
     */
    public function show(int $id): JsonResponse
    {
        $package = Package::with(['units.documents'])->findOrFail($id);

        return response()->json([
            'data' => $package,
        ]);
    }
}
