<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Order;
use App\Models\Package;
use App\Models\Question;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $recentOrders = Order::with(['user', 'items'])
            ->latest()
            ->limit(5)
            ->get();

        $recentEnrollments = Enrollment::with(['user', 'package'])
            ->latest('enrolled_at')
            ->limit(5)
            ->get();

        return response()->json([
            'message' => 'Chào mừng trở lại, ' . ($request->user()?->name ?? 'Quản trị viên') . '.',
            'metrics' => [
                'students' => User::where('role', 'student')->count(),
                'packages' => Package::where('is_active', true)->count(),
                'exams' => Exam::count(),
                'questions' => Question::count(),
                'enrollments' => Enrollment::count(),
                'paid_orders' => Order::paid()->count(),
                'revenue' => (float) Order::paid()->sum('total'),
            ],
            'recent_orders' => $recentOrders->map(fn (Order $order) => [
                'id' => $order->id,
                'code' => $order->code,
                'status' => $order->status,
                'total' => $order->total,
                'created_at' => $order->created_at,
                'customer' => $order->user?->name,
                'items_count' => $order->items->count(),
            ]),
            'recent_enrollments' => $recentEnrollments->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'student' => $enrollment->user?->name,
                'package' => $enrollment->package?->title,
                'enrolled_at' => $enrollment->enrolled_at,
            ]),
        ]);
    }
}
