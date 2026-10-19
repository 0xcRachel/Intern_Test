<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\Exam;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttemptController extends Controller
{
    public function __construct(
        protected ExamService $examService
    ) {}

    /**
     * Start Exam API (POST /api/exams/{id}/attempts)
     */
    public function start(Request $request, int $id): JsonResponse
    {
        $exam = Exam::with(['questions.options'])->findOrFail($id);

        $attempt = $this->examService->startAttempt($exam, $request->user()->id);

        return response()->json([
            'attempt_id' => $attempt->id,
            'id' => $attempt->id,
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'duration_minutes' => $exam->duration_minutes,
            'start_time' => $attempt->start_time,
            'questions' => $attempt->questions,
        ], 201);
    }

    /**
     * Submit Exam API (POST /api/attempts/{id}/submit)
     */
    public function submit(Request $request, int|string $id): JsonResponse
    {
        $attempt = Attempt::findOrFail($id);

        abort_if(
            (int) $attempt->user_id !== (int) $request->user()->id,
            403,
            'Unauthorized. You can only submit your own attempt.'
        );

        $validated = $request->validate([
            'answers' => ['sometimes', 'array'],
        ]);

        $answers = $validated['answers'] ?? [];

        $result = $this->examService->gradeAttempt($attempt, $answers);

        return response()->json($result);
    }

    /**
     * Result API (GET /api/attempts/{id})
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $attempt = Attempt::findOrFail($id);

        abort_if(
            (int) $attempt->user_id !== (int) $request->user()->id,
            403,
            'Unauthorized. You can only view your own attempt.'
        );

        $result = $this->examService->getAttemptResult($attempt);

        return response()->json($result);
    }
}
