<?php

use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Student\AttemptController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Student & User Exam list with caching
    Route::get('/exams', [ExamController::class, 'index']);
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
    Route::post('/attempts/{id}/submit', [AttemptController::class, 'submit']);
    Route::get('/attempts/{id}', [AttemptController::class, 'show']);
});
