<?php

use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\QuestionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return response()->json(['message' => 'Welcome Admin']);
    });

    Route::apiResource('exams', ExamController::class);
    Route::get('exams/{exam}/questions', [QuestionController::class, 'index']);
    Route::apiResource('questions', QuestionController::class)->except(['index']);
});
