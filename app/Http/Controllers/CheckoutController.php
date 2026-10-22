<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Enrollment;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(private readonly CheckoutService $checkoutService) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        $order = $this->checkoutService->checkout(
            $request->user(),
            $request->validated('package_ids'),
            $request->validated('coupon'),
        );

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }

    public function quote(CheckoutRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->checkoutService->quote(
                $request->user(),
                $request->validated('package_ids'),
                $request->validated('coupon'),
            ),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with('items:id,order_id,package_id,package_title,package_slug,price,quantity')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate((int) $request->query('per_page', 10));

        return response()->json([
            'data' => OrderResource::collection($orders)->resolve(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
            ],
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();
        abort_unless($order->user_id === $user->id || $user->role === 'admin', 403);

        return response()->json([
            'data' => new OrderResource($order->load(['items', 'user'])),
        ]);
    }

    public function myCourses(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 6), 1), 100);
        $enrollments = Enrollment::with(['package.units.documents', 'order'])
            ->where('user_id', $request->user()->id)
            ->latest('enrolled_at')
            ->paginate($perPage);

        $data = $enrollments->getCollection()->map(function (Enrollment $enrollment) {
            $package = $enrollment->package;

            if (! $package) {
                return null;
            }

            return [
                ...$package->toArray(),
                'enrollment_id' => $enrollment->id,
                'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
                'order_id' => $enrollment->order_id,
                'order_code' => $enrollment->order?->code,
            ];
        })->filter()->values();

        return response()->json([
            'data' => $data,
            'total' => $enrollments->total(),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'from' => $enrollments->firstItem(),
                'to' => $enrollments->lastItem(),
                'total' => $enrollments->total(),
                'per_page' => $enrollments->perPage(),
            ],
        ]);
    }
}
