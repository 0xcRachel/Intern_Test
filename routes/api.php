<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PackageController as AdminPackageController;
use App\Http\Controllers\Admin\PreviewStatisticsController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\Student\AttemptController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:6,1');

// OAuth (Google / GitHub). Callback URLs live under /api so Nginx can route
// them to PHP, while the browser is returned to the React app afterwards.
Route::get('/auth/providers', [SocialAuthController::class, 'providers']);
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])
    ->middleware('throttle:20,1');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback']);
Route::post('/auth/oauth/exchange', [SocialAuthController::class, 'exchange'])
    ->middleware('throttle:20,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Student & User Exam list with caching
    Route::get('/exams', [ExamController::class, 'index']);

    // Document Preview signer (rate-limited, signed URL is user-bound)
    Route::post('/documents/{id}/preview', [DocumentController::class, 'preview'])
        ->middleware('throttle:10,1');

    // Learner profile and storefront
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::get('/my/courses', [CheckoutController::class, 'myCourses']);
    Route::get('/orders', [CheckoutController::class, 'index']);
    Route::get('/orders/{order}', [CheckoutController::class, 'show']);
    Route::post('/checkout/quote', [CheckoutController::class, 'quote'])
        ->middleware('throttle:30,1');
    Route::post('/checkout', [CheckoutController::class, 'store'])
        ->middleware('throttle:12,1');
});

// Admin Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);

    Route::apiResource('packages', AdminPackageController::class);

    Route::get('preview-statistics', [PreviewStatisticsController::class, 'index']);

    Route::apiResource('exams', ExamController::class);
    Route::get('exams/{id}/statistics', [ExamController::class, 'statistics']);
    Route::get('exams/{exam}/questions', [QuestionController::class, 'index']);
    Route::apiResource('questions', QuestionController::class)->except(['index']);
});

// Student Routes
Route::middleware(['auth:sanctum', 'student'])->group(function () {
    Route::post('/exams/{id}/attempts', [AttemptController::class, 'start']);
    Route::post('/attempts/{id}/save', [AttemptController::class, 'autosave']);
    Route::patch('/attempts/{id}/save', [AttemptController::class, 'autosave']);
    Route::get('/attempts/{id}/resume', [AttemptController::class, 'resume']);
    Route::post('/attempts/{id}/submit', [AttemptController::class, 'submit']);
    Route::get('/attempts/{id}', [AttemptController::class, 'show']);
});

// IELTS Flow Routes
Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{id}', [PackageController::class, 'show']);

// Signed stream for enrolled users. The signature lets media elements load the
// file without attaching the bearer token; ownership is checked server-side.
Route::get('/documents/{document}/stream', [DocumentController::class, 'stream'])
    ->middleware('throttle:30,1')
    ->name('documents.stream');
