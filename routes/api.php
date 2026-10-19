<?php

use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\Student\AttemptController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Student & User Exam list with caching
    Route::get('/exams', [ExamController::class, 'index']);

    // Document Preview signer (rate-limited, signed URL is user-bound)
    Route::post('/documents/{id}/preview', [DocumentController::class, 'preview'])
        ->middleware('throttle:10,1');
});

// Admin Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return response()->json(['message' => 'Welcome Admin']);
    });

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

// Signed preview stream (the signature is the access grant; no bearer token
// is required so the URL can be embedded in a viewer/iframe).
Route::get('/documents/{document}/stream', [DocumentController::class, 'stream'])
    ->name('documents.stream');
